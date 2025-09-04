import {HttpErrors} from '@loopback/rest';

// export function validateCredentials(credential: Credentials) {
//   //Valida email
//   if (!isEmail.validate(credential.email)) {
//     throw new HttpErrors.UnprocessableEntity('Formato de email inválido');
//   }

//   //Valida contraseña
//   if (!credential.password || credential.password.length < 6) {
//     throw new HttpErrors.UnprocessableEntity(
//       'La contraseña debe tener entre 6 y 100 caracteres',
//     );
//   }
// }

export function validatePassword(password: string) {
  //Valida contraseña
  if (password.length < 8) {
    throw new HttpErrors.UnprocessableEntity(
      'La contraseña debe tener al menos 8 caracteres',
    );
  }
}
