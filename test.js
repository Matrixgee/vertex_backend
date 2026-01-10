const axios = require("axios");

class TestApi {
  constructor() {
    this.token = "";
    this.baseUrl = "http://localhost:8000/api";
    // this.baseUrl = "https://BlockInv-backend-qrf4.onrender.com/api";
  }

  get({ path, params }, log) {
    const url = `${this.baseUrl}${path}`;
    axios
      .get(url, {
        params,

        headers: { Authorization: `Bearer ${this.token}` },
      })
      .then((response) => {
        this.callback({ url, response }, log);
      })
      .catch((error) => {
        this.callback({ url, error });
      });
  }
  post({ path, body, params }, log) {
    const url = `${this.baseUrl}${path}`;
    axios
      .post(url, body, {
        params,
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .then((response) => {
        const data = response.data;
        if (data.token) this.token = data.token;

        this.callback({ url, response }, log);
      })
      .catch((error) => {
        this.callback({ url, error });
      });
  }
  patch({ path, body, params }) {
    const url = `${this.baseUrl}${path}`;
    axios
      .patch(url, body, {
        params,
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .then((response) => {
        this.callback({ url, response });
      })
      .catch((error) => {
        this.callback({ url, error });
      });
  }
  delete({ path, params }) {
    const url = `${this.baseUrl}${path}`;
    axios
      .delete(url, {
        params,
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .then((response) => {
        this.callback({ url, response });
      })
      .catch((error) => {
        this.callback({ url, error });
      });
  }
  //
  //
  callback({ url, response, error }, log = true) {
    console.log(url);

    if (response) {
      const data = response.data;
      if (log) console.log(data);
    } else if (error) {
      if (error.response) console.log(error.response.data);
      else console.log("Network Error", error);
    }
  }
  //
  //
  // Auth
  login({ email, password }) {
    this.post(
      {
        path: "/auth/login",
        body: { email, password },
      },
      false
    );
  }
  register({ name, username, email, password }) {
    this.post({
      path: "/auth/register",
      body: { name, username, email, password },
    });
  }
  //
  //
  // User
  profile() {
    this.get({ path: "/user/profile" });
  }
  updateProfile({ bitcoin, sol, ethereum }) {
    this.patch({ path: "/user/profile", body: { bitcoin, sol, ethereum } });
  }

  //
  //
  // Investment
  investments() {
    this.get({ path: "/investment/all" });
  }
  investment() {
    this.get({ path: `/investment/akjkasaksjass` });
  }
  createInvestment({ amount, plan_id }) {
    this.post({
      path: `/investment`,
      body: { amount, plan_id },
    });
  }
  //
  //
  // Withdrawal
  withdrawals() {
    this.get({ path: "/withdrawal/all" });
  }
  withdrawal() {
    this.get({ path: `/withdrawal/akjkasaksjass` });
  }
  createWithdrawal({ amount, to, method }) {
    this.post({
      path: `/withdrawal`,
      body: { amount, to, method },
    });
  }
  //
  //
  // Deposit
  deposits() {
    this.get({ path: "/deposit/all" });
  }
  deposit() {
    this.get({ path: `/deposit/akjkasaksjass` });
  }
  createDeposit({ amount, from, to, method }) {
    this.post({
      path: `/deposit`,
      body: { amount, from, to, method },
    });
  }
  //
  //
  // Plan
  plans() {
    this.get({ path: "/plan/all" });
  }
  plan() {
    this.get({ path: `/plan/akjkasaksjass` });
  }
  //
  //
  // Plan
  plans() {
    this.get({ path: "/plan/all" });
  }
  plan() {
    this.get({ path: `/plan/akjkasaksjass` });
  }
  //
  //
  // Transaction
  transactions() {
    this.get({ path: "/transaction/all" });
  }
  transaction() {
    this.get({ path: `/transaction/akjkasaksjass` });
  }
  //
  //
  // Earning
  earnings() {
    this.get({ path: "/earning/all" });
  }
  earning() {
    this.get({ path: `/earning/akjkasaksjass` });
  }
}

const testApi = new TestApi();
//
//
// Auth
function auth() {
  // testApi.register({
  //   name: "Sotonye",
  //   username: "sotonye_op",
  //   email: "sontonye@gmail.com",
  //   password: "123456",
  // });
  testApi.login({ email: "sontonye@gmail.com", password: "123456" });
}

function user() {
  testApi.profile();
  testApi.updateProfile({
    bitcoin: "bitcoin",
    sol: "sol",
    ethereum: "etheruem",
  });
}
function investment() {
  testApi.createInvestment({
    amount: 200,
    plan_id: "just id",
  });
  // testApi.investments();
  // testApi.investment();
}
function withdrawal() {
  testApi.createWithdrawal({
    amount: 200,
    to: "eth address",
    method: "crypto",
  });
  // testApi.withdrawals();
  // testApi.withdrawal();
}
function deposit() {
  testApi.createDeposit({
    amount: 200,
    from: "eth address",
    to: "eth address",
    method: "crypto",
  });
  // testApi.deposits();
  // testApi.deposit();
}
function plan() {
  // testApi.createPlan();
  testApi.plans();
  // testApi.plan();
}
function transaction() {
  testApi.transactions();
  // testApi.transaction();
}
function earnings() {
  testApi.earnings();
  // testApi.earnings();
}

auth();

setTimeout(() => {
  // user();
  // investment();
  // withdrawal();
  // deposit();
  plan();
  // transaction();
  // earnings();
}, 1000);
