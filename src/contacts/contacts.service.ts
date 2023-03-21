import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { configuration } from 'src/config';
import {
  Contact,
  ContactDocument,
  ContactInterface,
} from 'src/models/contact.model';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name, configuration.connectionName)
    private readonly contactModel: Model<ContactDocument>,
  ) {}

  async findAll({ keepId }: { keepId: boolean }) {
    const contacts = await this.contactModel.find();
    return this.json(contacts, { keepId });
  }

  async addContact(contact: ContactInterface) {
    const newContact = await this.contactModel.create(contact);
    await newContact.save();
    return this.json(newContact, { keepId: true });
  }

  async updateContact(key: string, value: never, id: string) {
    console.log(value);
    const contact = await this.contactModel.findByIdAndUpdate(
      id,
      {
        [key]: value,
      },
      { new: true },
    );
    return this.json(contact, { keepId: true });
    
  }

  async findWithFilter({
    field,
    operator,
    value,
  }: {
    field: string;
    operator: string;
    value?: string | null;
  }) {
    let contacts: Contact[] = [];

    if (operator === 'equals') {
      contacts = await this.contactModel.find({
        [field]: {
          $regex: new RegExp('^' + (value as string).toLowerCase() + '$', 'i'),
        },
      });
    } else if (operator === 'contains') {
      contacts = await this.contactModel.find({
        [field]: { $regex: value, $options: 'i' },
      });
    } else if (operator === 'startsWith') {
      contacts = await this.contactModel.find({
        [field]: {
          $regex: new RegExp('^' + (value as string).toLowerCase(), 'i'),
        },
      });
    } else if (operator === 'endsWith') {
      contacts = await this.contactModel.find({
        [field]: {
          $regex: new RegExp((value as string).toLowerCase() + '$', 'i'),
        },
      });
    } else if (operator === 'isEmpty') {
      contacts = await this.contactModel.find({
        [field]: { $in: [null, '', undefined] },
      });
    } else if (operator === 'isNotEmpty') {
      contacts = await this.contactModel.find({
        [field]: { $nin: [null, '', undefined] },
      });
    } else if (operator === 'isAnyOf') {
      contacts = await this.contactModel.find({
        $or: value.split(',').map((text) => ({
          [field]: {
            $regex: new RegExp('^' + (text as string).toLowerCase() + '$', 'i'),
          },
        })),
      });
    } else if (operator === 'search') {
      contacts = await this.contactModel.find({
        $or: [
          {
            first_name: { $regex: value, $options: 'i' },
          },
          {
            middle_name: { $regex: value, $options: 'i' },
          },
          {
            last_name: { $regex: value, $options: 'i' },
          },
        ],
      });
    }

    return this.json(contacts, { keepId: false });
  }

  async insertManyContact(contacts: ContactInterface[]) {
    const contactsInserted = await this.contactModel.insertMany(contacts);
    return await this.findAll({ keepId: true });
  }

  getContactInterfaceFromRaw(contactRaw: {
    [key: string]: any;
  }): ContactInterface {
    const emailKeys = Object.keys(contactRaw).filter((key) =>
      key.startsWith('email'),
    );
    const phoneKeys = Object.keys(contactRaw).filter((key) =>
      key.startsWith('phone'),
    );
    const contact: ContactInterface = {
      first_name: contactRaw['first_name'],
      middle_name: contactRaw['middle_name'],
      last_name: contactRaw['last_name'],
      emails: emailKeys.map((key) => contactRaw[key]),
      country: contactRaw['country'],
      town: contactRaw['town'],
      province: contactRaw['province'],
      adress: contactRaw['adress'],
      company: contactRaw['company'],
      category: contactRaw['category'],
      groupe: contactRaw['groupe'],
      phones: phoneKeys.map((key) => ({ phone: contactRaw[key] })),
      status: contactRaw['status'],
      flashApId: contactRaw['flashApId'],
    };
    return contact;
  }

  isSimilar(contactOne: Contact, contactTwo: Contact) {
    return (
      contactOne.first_name === contactTwo.first_name &&
      contactOne.emails.join() === contactTwo.emails.join() &&
      contactOne.phones.map(({ phone }) => phone).join() ===
        contactTwo.phones.map(({ phone }) => phone).join()
    );
  }

  async clean() {
    // récuperer tous les contacts
    const contacts = await this.contactModel.find();
    // retirer les doublons
    const items = [];
    for (const contact of contacts) {
      if (items.findIndex((c) => this.isSimilar(c, contact)) === -1) {
        items.push(contact);
        const { emails } = contact;
        const hasEmailWithSpace =
          emails.findIndex((email) => email.includes(' ')) !== -1;
        if (hasEmailWithSpace) {
          await this.contactModel.findByIdAndUpdate(contact._id, {
            emails: emails.map((email) => email.replace(/ /g, '')),
          });
        }
      } else {
        // delete contact
        await this.contactModel.findByIdAndDelete(contact._id);
      }
    }
    // enlever les espaces des emails
    return this.findAll({ keepId: true });
  }

  json(
    contacts: Contact | Contact[],
    options: { keepId: boolean },
  ): { [key: string]: any } | { [key: string]: any }[] {
    const { keepId } = options;

    if (Array.isArray(contacts)) {
      return contacts.map((contact) => this.json(contact, { keepId }));
    }

    const contact = contacts as Contact;

    const {
      first_name,
      middle_name,
      last_name,
      emails,
      country,
      town,
      province,
      adress,
      company,
      labels,
      status,
      category,
      groupe,
      phones,

      flashApId,
    } = contact;

    return {
      ...(keepId ? { id: contact._id } : {}),
      first_name,
      middle_name,
      last_name,
      ...emails.reduce(
        (prev, email, index) => ({ ...prev, [`email_${index + 1}`]: email }),
        {},
      ),
      country,
      town,
      province,
      adress,
      company,
      labels,
      status,
      category,
      groupe,
      flashApId,
      ...phones.reduce(
        (prev, item, index) => ({
          ...prev,
          [`phone_${index + 1}`]: item.phone,
        }),
        {},
      ),
      ...phones.reduce(
        (prev, item, index) => ({
          ...prev,
          ...(item.label ? { [`label_phone_${index + 1}`]: item.label } : {}),
        }),
        {},
      ),
    };
  }

  async deleteMany(ids: string[]) {
    await this.contactModel.deleteMany({ _id: { $in: ids } });
    return ids;
  }
}
