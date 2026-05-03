Сброс пароля (reset-password) - это отдельная страница, куда пользователь попадает по ссылке из email.
Как это работает:

Пользователь на /auth/forgot-password вводит email
Сервер отправляет email с токеном (в вашем случае пока логирует в консоль)
Email содержит ссылку типа:

   http://yourapp.com/auth/reset-password?email=user@example.com&token=ABC123XYZ...

Пользователь кликает ссылку и попадает на страницу reset-password
На странице reset-password он вводит новый пароль

В вашем коде это уже реализовано:
Forgot Password генерирует ссылку:
typescript// В forgot-password.component.ts
if (response.debugToken) {
  console.log('Reset URL:', 
    `/auth/reset-password?email=${response.debugEmail}&token=${encodeURIComponent(response.debugToken)}`
  );
}
Reset Password принимает параметры:
typescript// В reset-password.component.ts
ngOnInit(): void {
  this.token = this.route.snapshot.queryParams['token'] || '';
  this.email = this.route.snapshot.queryParams['email'] || '';
  // ...
}
Ничего больше добавлять не нужно - это отдельный flow, куда пользователь попадает из email, а не через меню приложения.