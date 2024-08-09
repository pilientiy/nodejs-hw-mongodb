import { SORT_ORDER } from '../constants/constants.js';
import ContactsCollection from '../db/models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = SORT_ORDER.ASC,
  filter = {},
  userId,
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactsFilter = ContactsCollection.find();

  if (filter.type) {
    contactsFilter.where('contactType').equals(filter.type);
  }

  if (filter.isFavourite !== null) {
    contactsFilter.where('isFavourite').equals(filter.isFavourite);
  }

  contactsFilter.where('userId').equals(userId);

  const [count, data] = await Promise.all([
    ContactsCollection.find().merge(contactsFilter).countDocuments(),
    ContactsCollection.find()
      .merge(contactsFilter)
      .skip(skip)
      .limit(limit)
      .sort({
        [sortBy]: sortOrder,
      })
      .exec(),
  ]);

  const paginationInformation = calculatePaginationData(page, perPage, count);

  return { data, ...paginationInformation };
};

export const getContactById = async (id, userId) => {
  return await ContactsCollection.findOne({
    _id: id,
    userId,
  });
};

export const createContact = async (payload, userId) => {
  return await ContactsCollection.create({ ...payload, userId });
};

export const updateContact = async (id, payload, userId) => {
  return await ContactsCollection.findOneAndUpdate(
    { _id: id, userId },
    payload,
    { new: true },
  );
};

export const deleteContactById = async (id, userId) => {
  return await ContactsCollection.findOneAndDelete({ _id: id, userId });
};
