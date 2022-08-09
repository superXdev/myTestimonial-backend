# myTestimonial-backend
This is backend app (API) for https://github.com/superXdev/mytestimonial

## Main stack
- Expressjs
- Sequelize
- Telegraf

## Setup
1. Clone this repo
```sh
git clone https://github.com/superXdev/myTestimonial-backend.git
```
2. Install all dependencies
```sh
npm install
```
3. Set database, telegram & file configuration
```sh
# copy config file
cp config/config.bak config/config.json

# open config/config.json file
# set database connection, telegram username
```
4. By default, the file storage is local. You can change it to imgbb service by entering API key into attributes `imgbb_key`
5. Run development server (using nodemon)
```sh
npm run dev
```
6. Or run prod server
```sh
npm start
```

## License

myTestimonial is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).