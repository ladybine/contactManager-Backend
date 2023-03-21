import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
  Res,
  Put,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContactsService } from './contacts.service';
import * as excelReader from 'xlsx';
import { ContactInterface } from 'src/models/contact.model';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { parse } from 'csv-parse';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { CreateContactDto } from './dtos/create.contact.dto';
import { updateContactDto } from './dtos/update.contact.dto';
import { DeleteManyDto } from './dtos/delete.many.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private contactService: ContactsService) {}

  @Get()
  getAll() {
    return this.contactService.findAll({ keepId: true });
  }

  @Post()
  create(@Body() data: CreateContactDto) {
    const { country, town, province } = data;
    console.log(data);
    const contact: ContactInterface = {
      first_name: data.first_name,
      last_name: data.last_name,
      middle_name: data.middle_name,
      emails: data.emails,
      country,
      town,
      province,
      adress: data.adress,
      company: data.company,
      groupe: data.groupe,
      flashApId: data.flashApId,
      phones: Array.isArray(data.phones)
        ? data.phones.map((phone) => ({ phone }))
        : [{ phone: data.phones }],
      status: data.status,
      category: data.category,
    };
    return this.contactService.addContact(contact);
  }
  @Put('clean')
  clean() {
    return this.contactService.clean();
  }

  @Put('update')
  updateContact(@Body() data: updateContactDto) {
    const { key, value, id } = data;
    return this.contactService.updateContact(key, value, id);
  }

  @Post('csv')
  @UseInterceptors(FileInterceptor('file'))
  async importFromCsv(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const fileContent = readFileSync(file.path, { encoding: 'utf-8' });

    parse(
      fileContent,
      {
        delimiter: ',',
      },
      async (error, result: { [key: string]: any }[]) => {
        if (error) {
          throw new HttpException(
            "Problème dans l'importation",
            HttpStatus.BAD_REQUEST,
          );
        }
        const contacts: ContactInterface[] = [];

        for (let i = 1; i < result.length; i++) {
          const contactRaw = result[i];
          try {
            const contact =
              this.contactService.getContactInterfaceFromRaw(contactRaw);
            contacts.push(contact);
          } catch (e) {
            console.log(e);
          }
        }
        const dbContacts = await this.contactService.insertManyContact(
          contacts,
        );
        res.json(dbContacts);
      },
    );
  }

  @Post('excel')
  @UseInterceptors(FileInterceptor('file'))
  importFromExcel(@UploadedFile() file: Express.Multer.File) {
    const excelFile = excelReader.readFile(file.path);

    const contacts: ContactInterface[] = [];

    const sheets = excelFile.SheetNames;

    const data = [];

    for (let i = 0; i < sheets.length; i++) {
      const temp = excelReader.utils.sheet_to_json(
        excelFile.Sheets[excelFile.SheetNames[i]],
      );
      temp.forEach((res) => {
        data.push(res);
      });
    }

    for (let i = 0; i < data.length; i++) {
      const contactRaw = data[i];
      try {
        const contact =
          this.contactService.getContactInterfaceFromRaw(contactRaw);
        contacts.push(contact);
      } catch (e) {
        console.log(e);
      }
    }

    return this.contactService.insertManyContact(contacts);
  }

  @Get('excel')
  async exportToExcel(
    @Res() res: Response,
    @Query('field') field: string | null | undefined,
    @Query('operator') operator: string | null | undefined,
    @Query('value') value: string | null | undefined,
  ) {
    const isFilterValid =
      (field && operator && value) ||
      (field && (operator === 'isEmpty' || operator === 'isNotEmpty'));
    const contacts = isFilterValid
      ? await this.contactService.findWithFilter({ field, operator, value })
      : await this.contactService.findAll({ keepId: false });

    const contactsInJson = contacts as {
      [key: string]: any;
    }[];

    const workBook = excelReader.utils.book_new();

    const workSheet = excelReader.utils.json_to_sheet(contactsInJson);
    excelReader.utils.book_append_sheet(workBook, workSheet, 'Contacts');
    const dir = join(process.cwd(), 'exports');
    if (!existsSync(dir)) {
      mkdirSync(dir);
    }
    const exportFileName = join(
      process.cwd(),
      'exports',
      `${randomUUID()}_response.xls`,
    );
    excelReader.writeFile(workBook, exportFileName);
    res.sendFile(exportFileName);
  }

  @Delete()
  deleteMany(@Body() data: DeleteManyDto) {
    const { ids } = data;
    return this.contactService.deleteMany(ids);
  }
}
