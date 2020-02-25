const privateFunc = () => {
    console.log('Вызов приватной функции модуля');
 }
  
 const publicFunc = (name) => {
    privateFunc();
    console.log('Вызов публичной функции из модуля');
    console.log(`Привет, ${name}!`);
 }
  
 export default publicFunc;