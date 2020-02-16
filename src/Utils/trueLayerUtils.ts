import {Transaction} from "../Transactions/Transaction";

export const getExampleTransactions = (userId: string, accountId: string): Transaction[] => {
  return [
    {
      userId,
      accountId,
      "transaction_id": "03c333979b729315545816aaa365c33f",
      "timestamp": "2018-03-06T00:00:00",
      "description": "GOOGLE PLAY STORE",
      "amount": -2.99,
      "currency": "GBP",
      "transaction_type": "DEBIT",
      "transaction_category": "PURCHASE",
      "transaction_classification": [
        "Entertainment",
        "Games"
      ],
      "merchant_name": "Google play",
      "running_balance": {
        "amount": 1238.60,
        "currency": "GBP"
      },
      "meta": {
        "bank_transaction_id": "9882ks-00js",
        "provider_transaction_category": "DEB"
      }
    },
    {
      accountId,
      userId,
      "transaction_id": "3484333edb2078e77cf2ed58f1dec11e",
      "timestamp": "2018-02-18T00:00:00",
      "description": "PAYPAL EBAY",
      "amount": -25.25,
      "currency": "GBP",
      "transaction_type": "DEBIT",
      "transaction_category": "PURCHASE",
      "transaction_classification": [
        "Shopping",
        "General"
      ],
      "merchant_name": "Ebay",
      "meta": {
        "bank_transaction_id": "33b5555724",
        "provider_transaction_category": "DEB"
      }
    }
  ];
};
export const getExampleAccountResponse = (accountId: string, accountType: string, displayName: string) => {
  return {
    "results": [
      {
        "update_timestamp": "2017-02-07T17:29:24.740802Z",
        "account_id": accountId,
        "account_type": accountType,
        "display_name": displayName,
        "currency": "GBP",
        "account_number": {
          "iban": "GB35LOYD12345678901234",
          "number": "12345678",
          "sort_code": "12-34-56",
          "swift_bic": "LOYDGB2L"
        },
        "provider": {
          "display_name": "Lloyds Bank",
          "logo_uri": "https://auth.truelayer.com/img/banks/banks-icons/lloyds-icon.svg",
          "provider_id": "lloyds"
        }
      }
    ]
  };
};

export const getExampleTransactionResponse = () => {
  return {
    "results": [
      {
        "transaction_id": "03c333979b729315545816aaa365c33f",
        "timestamp": "2018-03-06T00:00:00",
        "description": "GOOGLE PLAY STORE",
        "amount": -2.99,
        "currency": "GBP",
        "transaction_type": "DEBIT",
        "transaction_category": "PURCHASE",
        "transaction_classification": [
          "Entertainment",
          "Games"
        ],
        "merchant_name": "Google play",
        "running_balance": {
          "amount": 1238.60,
          "currency": "GBP"
        },
        "meta": {
          "bank_transaction_id": "9882ks-00js",
          "provider_transaction_category": "DEB"
        }
      },
      {
        "transaction_id": "3484333edb2078e77cf2ed58f1dec11e",
        "timestamp": "2018-02-18T00:00:00",
        "description": "PAYPAL EBAY",
        "amount": -25.25,
        "currency": "GBP",
        "transaction_type": "DEBIT",
        "transaction_category": "PURCHASE",
        "transaction_classification": [
          "Shopping",
          "General"
        ],
        "merchant_name": "Ebay",
        "meta": {
          "bank_transaction_id": "33b5555724",
          "provider_transaction_category": "DEB"
        }
      }
    ]
  };
};