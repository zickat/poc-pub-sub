import {Dictionary} from "./types";

export const splitPath = (path: string) => {
  if (path[0] === '/') {
    path = path.substring(1);
  }
  return path.replace(new RegExp('/', 'g'), '.').split('.');
};

export const formatPath = (path: string): string => {
  const a = splitPath(path);
  return a
    .map(s => {
      if (s[0] === ':') return '*';
      return s;
    })
    .join('.');
};

export const createParams = (
  path: string,
  subject: string,
): Dictionary<string> => {
  const pathArray = splitPath(path);
  const subjectArray = subject.split('.');

  return pathArray.reduce((acc: Dictionary<string>, p, index) => {
    if (p[0] === ':') {
      acc[p.substring(1)] = subjectArray[index];
    }
    return acc;
  }, {});
};
