import moment from 'moment';

export const formatDateString = (date) => (
  moment(date).format('MMMM D YYYY')
);

export const formatDateLabel = (date) => (
  formatDateString(date).replaceAll(' ', '-')
);