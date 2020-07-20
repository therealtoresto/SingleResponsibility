'use strict';

const fs = require('fs').promises;

const ENTER = 13;

class User {
    constructor(id, data) {
        const { name, login, password, email } = data;
        this[Symbol.for('id')] = id;
        this.name = name;
        this.login = login;
        this.password = password;
        this.email = email;
    }
}

class Database {
    constructor(parser) {
        this._parser = parser;
    }

    fileName(id) {
        return `./user${id}.${this._parser.name}`;
    }

    async read(id) {
        const data = await fs.readFile(this.fileName(id), 'utf8');
        const obj = this._parser.parse(data);
        return new User(id, obj);
    }

    async save(user) {
        const data = this._parser.serialize(user);
        const id = user[Symbol.for('id')];
        await fs.writeFile(this.fileName(id), data);
    }
}

class Input {
    constructor(prompt, mask) {
        process.stdin.setRawMode(true);
        process.stdout.write(prompt);
        this._resolve = null;
        this._input = [];

        process.stdin.on('data', chunk => {
            const key = chunk[0];
            if (key === ENTER) {
                process.stdout.write('\n');
                this.done();
                return;
            }
            process.stdout.write(mask);
            this._input.push(chunk);
        });
         
        return new Promise(resolve => {
            this._resolve = resolve;
        });
    }

    done() {
        process.stdin.removeAllListeners('data');
        process.stdin.setRawMode(false);
        const value = Buffer.concat(this._input).toString();
        this._resolve(value);
    }
}

const isPasswordValid = password => password.length >= 7;


const userToString = ({ name, login, email }) => 
    `User: ${login} (${name}) <${email}>`;

// Usage

(async () => {
    const config = require('./config.js', 'utf8');
    const Parser = require(`./${config.format}.js`)
    const parser = new Parser();
    const db = new Database(parser);
    const user = await db.read(2073);
    console.log(userToString(user));
    const password = await new Input('Enter new Password: ', '*');
    const valid = isPasswordValid(password);
    if (valid) {
        user.password = password;
        await db.save(user);
    }
    console.log('Password:', valid ? 'is valid' : 'is not valid');
    console.log(userToString(user));
    process.exit(0)
})();