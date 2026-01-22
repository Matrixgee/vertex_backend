const swaggerAutogen = require("swagger-autogen");

const doc = {
  info: {
    version: "v1.0.0",
    title: "TradeMark",
    description: "TradeMark REST API Documentation",
  },
  servers: [
    {
      url: "http://localhost:8000/api/",
      description: "Local Host",
    },
  ],
  components: {
    schemas: {
      //
      //
      //
      // Auth
      RegisterRequest: {
        $name: "string",
        $username: "string",
        $email: "string@m.m",
        $password: "string",
        $phoneNumber: "string",
        referralId: "string",
      },
      VerifyRequest: {
        $otp: "number",
        $token: "string",
      },
      ResendVerificationRequest: {
        $email: "string@m.m",
      },
      LoginRequest: {
        $email: "string@m.m",
        $password: "string",
      },
      ForgotPasswordRequest: {
        $email: "string@m.m",
      },
      ChangePasswordRequest: {
        $email: "string@m.m",
        $oldPassword: "",
        $newPassword: "",
      },
      AdminCreditDebitRequest: {
        $wallet: "balance | bitcoin | ethereum | sol",
        $amount: 500,
        $action: "credit | debit",
      },

      //
      //
      // User
      ProfileRequest: {
        $bitcoin: "string",
        $sol: "string",
        $ethereum: "string",
        $profilePic: "string",
        $phoneNumber: "string",
        $dob: "string",
        $state: "string",
        $city: "string",
        $bankName: "string",
        $accountNumber: "string",
        $routingNumber: "string",
      },
      //
      //
      // Investment
      InvestmentRequest: {
        $plan_id: "string",
        $amount: "number",
        $method: "string [BTC | ETH | SOL]",
      },
      //
      //
      // Withdrawal
      WithdrawalRequest: {
        $amount: "number",
        $to: "string",
        $method: "string",
      },
      //
      //
      // Earning
      EarningRequest: {
        $amount: "number",
        $plan_id: "string",
        $investment_id: "string",
      },
      //
      //
      // Deposit
      AdminDepositRequest: {
        $amount: "number",
      },
      DepositRequest: {
        $amount: "number",
        $from: "string",
        $method: "string",
      },
      //
      //
      // Plans
      PlanRequest: {
        $name: "string",
        $returns: "string",
        $minAmount: "string",
        $duration: "string",
        $maxAmount: "string",
        $uid: "string",
      },

      //
      //
      // Responses
      Response: {
        message: "string",
      },
      //
      // Auth
      LoginResponse: {
        message: "string",
        token: "string",
        data: {
          user: {
            id: "string",
            name: "string",
            username: "string",
            uid: "string",
            email: "string@m.m",
            balance: "number",
            activeInvestments: "number",
            pendingWithdrawals: "number",
            earnings: "number",
            verified: "boolean",
            referralId: "string",
            bitcoin: "string",
            sol: "string",
            ethereum: "string",
            phoneNumber: "string",
            dob: "string",
            state: "string",
            city: "string",
            bankName: "string",
            accountNumber: "string",
            routingNumber: "string",
            type: "admin | user",
            createdAt: "number",
            updatedAt: "number",
          },
        },
      },
      ProfileResponse: {
        message: "string",
        data: {
          id: "string",
          name: "string",
          username: "string",
          uid: "string",
          email: "string@m.m",
          password: "string",
          balance: "number",
          activeInvestments: "number",
          pendingWithdrawals: "number",
          earnings: "number",
          verified: "boolean",
          referralId: "string",
          bitcoin: "string",
          sol: "string",
          ethereum: "string",
          type: "admin | user",
          createdAt: "number",
          updatedAt: "number",
        },
      },
      ProfilesResponse: {
        message: "string",
        data: [
          {
            name: "string",
            username: "string",
            profilePic: "string",
            uid: "string",
            email: "string@m.m",
            password: "string",
            balance: "number",
            verified: "boolean",
            referralId: "string",
            bitcoin: "string",
            sol: "string",
            ethereum: "string",
            type: "admin | user",
            createdAt: "number",
            updatedAt: "number",
          },
        ],
      },
      //
      //
      // Investments
      InvestmentsResponse: {
        message: "string",
        data: [
          {
            id: "string",
            uid: "string",
            name: "string",
            email: "string",
            plan_name: "string",
            plan_id: "string",
            duration: "string",
            amount: "number",
            status: "string [pending | approved | declined]",
            createdAt: "number",
            updatedAt: "number",
          },
        ],
      },
      InvestmentResponse: {
        message: "string",
        data: {
          uid: "string",
          name: "string",
          email: "string",
          plan_name: "string",
          plan_id: "string",
          duration: "string",
          amount: "number",
          status: "string [pending | approved | declined]",
          createdAt: "number",
          updatedAt: "number",
        },
      },
      //
      //
      // Withdrawals
      WithdrawalsResponse: {
        message: "string",
        data: [
          {
            id: "string",
            uid: "string",
            amount: "number",
            to: "string",
            method: "string",
            status: "string [pending | approved | declined]",
            createdAt: "number",
            updatedAt: "number",
          },
        ],
      },
      WithdrawalResponse: {
        message: "string",
        data: {
          id: "string",
          uid: "string",
          amount: "number",
          to: "string",
          method: "string",
          status: "string [pending | approved | declined]",
          createdAt: "number",
          updatedAt: "number",
        },
      },
      //
      //
      // Deposits
      DepositsResponse: {
        message: "string",
        data: [
          {
            id: "string",
            uid: "string",
            amount: "number",
            from: "string",
            to: "string",
            method: "string",
            status: "string [pending | approved | declined]",
            createdAt: "number",
            updatedAt: "number",
          },
        ],
      },
      DepositResponse: {
        message: "string",
        data: {
          id: "string",
          uid: "string",
          amount: "number",
          from: "string",
          to: "string",
          method: "string",
          status: "string [pending | approved | declined]",
          createdAt: "number",
          updatedAt: "number",
        },
      },
      //
      //
      // Earnings
      EarningsResponse: {
        message: "string",
        data: [
          {
            id: "string",
            uid: "string",
            amount: "number",
            plan_name: "string",
            plan_id: "string",
            investment_id: "string",
            createdAt: "number",
            updatedAt: "number",
          },
        ],
      },
      EarningResponse: {
        message: "string",
        data: {
          id: "string",
          uid: "string",
          amount: "number",
          plan_name: "string",
          plan_id: "string",
          investment_id: "string",
          createdAt: "number",
          updatedAt: "number",
        },
      },
      //
      //
      // Credits/Debits

      AdminCreditDebitResponse: {
        message: "string",
        data: {
          uid: "string",
          wallet: "string",
          action: "credit | debit",
          amount: "number",
          newBalance: "number",
        },
      },

      //
      //
      // Transactions
      TransactionsResponse: {
        message: "string",
        data: [
          {
            id: "string",
            uid: "string",
            amount: "number",
            from: "string",
            to: "string",
            plan_name: "string",
            plan_id: "string",
            investment_id: "string",
            type: "string",
            status: "string",
            createdAt: "number",
            updatedAt: "number",
          },
        ],
      },
      TransactionResponse: {
        message: "string",
        data: {
          id: "string",
          uid: "string",
          amount: "number",
          from: "string",
          to: "string",
          plan_name: "string",
          plan_id: "string",
          investment_id: "string",
          type: "string",
          status: "string",
          createdAt: "number",
          updatedAt: "number",
        },
      },
      //
      //
      // Plans
      PlansResponse: {
        message: "string",
        data: [
          {
            $name: "string",
            $returns: "string",
            $minAmount: "string",
            $duration: "string",
            $maxAmount: "string",
            $uid: "string",
          },
        ],
      },
      PlanResponse: {
        message: "string",
        data: {
          $name: "string",
          $returns: "string",
          $minAmount: "string",
          $duration: "string",
          $maxAmount: "string",
          $uid: "string",
        },
      },
    },
  },
  definitions: {
    BadRequest: {
      message: "Bad Request.",
    },
    InvalidToken: {
      message: "Invalid Token.",
    },
    Conflict: {
      message: "Username or email exists already exists.",
    },
    NotExists: {
      message: "Does not exists.",
    },
    InvalidID: {
      message: "Invalid ID.",
    },
    InvalidOTP: {
      message: "Invalid OTP.",
    },
    InsufficientBalance: {
      message: "User does not have sufficient balance.",
    },
  },
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
    },
  },
};

const outputFile = "./swaggerOutput.json";
const endpointsFiles = ["./src/routers/index.js"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
