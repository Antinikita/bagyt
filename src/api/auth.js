import axiosClient from './axios-client';

export async function forgotPassword(email) {
  const { data } = await axiosClient.post('/forgot-password', { email });
  return data;
}

export async function resetPassword({ token, email, password, password_confirmation }) {
  const { data } = await axiosClient.post('/reset-password', {
    token,
    email,
    password,
    password_confirmation,
  });
  return data;
}

export async function deleteAccount(currentPassword) {
  const { data } = await axiosClient.delete('/user', {
    data: { current_password: currentPassword },
  });
  return data;
}

export async function listTokens() {
  const { data } = await axiosClient.get('/tokens');
  return data;
}

export async function revokeToken(tokenId) {
  await axiosClient.delete(`/tokens/${tokenId}`);
}
