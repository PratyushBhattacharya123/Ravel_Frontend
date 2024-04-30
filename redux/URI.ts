import {Platform} from 'react-native';

let URI = '';

if (Platform.OS === 'ios') {
  URI = 'https://ravel-backend.onrender.com/api/v1/';
} else {
  URI = 'https://ravel-backend.onrender.com/api/v1/';
}

// if (Platform.OS === 'ios') {
//   URI = 'http://localhost:8000/api/v1/';
// } else {
//   URI = 'http://10.0.2.2:8000/api/v1/';
// }

export {URI};
