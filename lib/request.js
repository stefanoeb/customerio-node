const axios = require('axios').default;
const TIMEOUT = 10000;

class Request {
  constructor(auth, defaults) {
    if (typeof auth === 'object') {
      this.apikey = auth.apikey;
      this.siteid = auth.siteid;

      this.auth = `Basic ${Buffer.from(`${this.siteid}:${this.apikey}`, 'utf8').toString('base64')}`;
    } else {
      this.appKey = auth;
      this.auth = `Bearer ${this.appKey}`;
    }

    this.defaults = Object.assign(
      {
        timeout: TIMEOUT,
      },
      defaults,
    );
    this._axios = axios.create(this.defaults);
  }

  options(uri, method, data) {
    const headers = {
      Authorization: this.auth,
      'Content-Type': 'application/json',
    };
    const body = data ? JSON.stringify(data) : null;
    const options = { method, uri, headers, body };

    if (!body) delete options.body;

    return options;
  }

  handler(options) {
    return new Promise((resolve, reject) => {
      this._axios(options)
        .then((response) => {
          if (response.status == 200 || response.status == 201) {
            resolve(response.data);
          } else {
            reject({
              message: response.statusText || 'Unknown error',
              statusCode: response.status,
              response: response,
              body: response.data,
            });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  put(uri, data = {}) {
    return this.handler(this.options(uri, 'PUT', data));
  }

  destroy(uri) {
    return this.handler(this.options(uri, 'DELETE'));
  }

  post(uri, data = {}) {
    return this.handler(this.options(uri, 'POST', data));
  }
}

module.exports = Request;
