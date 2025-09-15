import axios from 'axios';

const explorerAPI = axios.create({
  baseURL: '/',
  withCredentials: false,
});

export default explorerAPI;
