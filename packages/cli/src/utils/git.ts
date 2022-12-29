import axios from 'axios';
import {  templateRepos } from './constants';
import {getAll} from './files'

// 获取模板列表
export const fetchRepoList = async () => {
  const data = templateRepos.map((item) => ({ name: item }));
  return data;
};

// 获取tag列表
export const fetchTagList = async (repo: string) => {
  const CONFIG = await getAll();
  const { data } = await axios.get(`${CONFIG.API_BASE}/repos/chenshuaifeng110/${repo}/tags`);
  return data;
};