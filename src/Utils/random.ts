export const randomString = (prefix = 'string') => {
  return `${prefix}${Math.floor(Math.random() * 1000000)}`
};