# RF cli

A command-line interface to interact with Request Finance, for developers.

## Install
```bash
git clone git@github.com:benjlevesque/rf.git
cd rf
pnpm install
pnpm build
pnpm link --global
```

## Setup

```bash
rf init
```

## Usage

### Help

```bash
rf --help
rf [command] --help
```

### Create an invoice
```bash
rf create [template name]
rf create test
rf create test --prod
rf create test --staging invoiceCurrency="USD" paymentCurrency="xDAI-xdai"
```

See the [Templates](#Templates) section to undersand the `test` parameter, as well as `invoiceCurrency` and `paymentCurrency`. 


### Interract with the API

`rf` provides a simplified way to interract with the API, without handling authentication, API URL or network type. 

```bash
rf api [method] [path]
rf api GET /users
```

You may use `:lastId` as a placeholder to refer to the latest created item:
```bash
rf create test
rf api get /invoices/:lastId
```

### Usage with other clients

A good use of this CLI is to use it with [httpie](https://httpie.io/) or [curl](https://curl.se/) for advanced HTTP requests.

```bash
http :4000/users Authorization:"Bearer $(rf --dev auth:token)" "X-Network":test
```


## Concepts

### Profile

A Profile is a configuration. It defines the API URL, the Auth0 settings, the network type (`live` or `test`), and the user's credentials.

The default profiles available are the following:

| Profile                       | API            | Network Type | UI to use                             |
| ----------------------------- | -------------- | ------------ | ------------------------------------- |
| `-p dev` or `--dev` (Default) | Localhost      | `test`       | http://localhost:3000/                |
| `-p staging` or `--staging`   | Production API | `test`       | https://baguette-app.request.finance/ |
| `-p prod` or `--prod`         | Production API | `live`       | https://app.request.finance/          |

You can have custom profiles, using `--profile [NAME]` or `-p [NAME]`.

Configuration for the profiles is stored in `~/.rf/`


### Templates
The `rf create` command is based on [json templates](https://github.com/datavis-tech/json-templates) and the [faker](https://www.npmjs.com/package/@faker-js/faker) library. This template will be used as the body of the HTTP POST request.

See the [declarative invoice template](./.templates/invoices/declarative.json) as an example. 

The first argument of this command is the name of the template. You can use pre-defined templates (run `rf templates:list` for the list) or create your own.

For templates others than invoices, you may create another folder, and pass the folder name in the `--type` flag. eg: `rf create mytemplate --type expense-reports`. The folder name must match the endpoint you want to call on the API!

#### Override values
You can override each key in the template by passing it to the `create` command: for instance, if you want to override `invoiceItems[0].currency` in the template above, you can use `rf create declarative invoiceCurrency=USD`

#### Commands

List available templates: 
```bash 
rf templates:list
```

Update templates based on this git repo (cloned locally):
```bash 
cd PATH/TO/LOCAL/REPO
git pull
rf templates:update
```


Templates are stored in `~/.rf/templates/[TYPE]`
