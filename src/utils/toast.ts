import { toast as toastify } from 'react-toastify';

export const toast = (
  arg:
    | string
    | {
        message: string;
        type?: string;
      }
) => {
  let message: string;
  let type = 'success';

  if (typeof arg === 'string') {
    message = arg;
  } else {
    message = arg.message;
    type = (arg.type || 'success').toLowerCase();
  }

  switch (type) {
    case 'success':
      toastify.success(message);
      break;

    case 'error':
      toastify.error(message);
      break;

    case 'warning':
      toastify.warning(message);
      break;

    
  }
};