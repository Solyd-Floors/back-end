
const fs = require("fs");
const path = require('path')


let folders = fs.readdirSync(path.resolve(__dirname,"../libs"))

let files = []

let swagger_doc = {
    "openapi": "3.0.0",
    "info": {
      "title": "API Docs",
      "description": "",
      "contact": {
        "email": "gjergjk71@gmail.com"
      },
      "license": {
        "name": "Apache 2.0",
        "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
      },
      "version": "1.0.0"
    },
    "servers": [
      {
        "description" : "Works only in self-hosted",
        "url" : "http://localhost:4000/api/v1"
      }
    ],
    "tags": [],
    "paths": {},
    "components": {
      "securitySchemes": {
        "jwt_auth" : {
          "description" : "Example value: \"Bearer <jwt_token>\"",
          "type" : "apiKey",
          "name" : "Authorization",
          "in" : "header"
        }
      },
      "schemas": {
        "ApiResponse": {
          "type": "object",
          "properties": {
            "message": {
              "type": "string",
              "example": "success"
            },
            "code": {
              "type": "integer",
              "example": 200
            }
          }
        }
      }
    }
}

for (folder of folders) {
    console.log(folder)
    append = fs.readdirSync(path.resolve(__dirname,"../libs",folder)).filter(fn => fn.endsWith('validations.js'))
    append = append.map(file => path.resolve(__dirname,"../libs",folder,file))
    files = files.concat(append)
}

for (file of files){
    console.log(file)
    let validations = require(file);
    let validation_keys = Object.keys(validations);
    for (key of validation_keys){
        swagger_doc.paths[key] = {
            "get": {
                "summary": "Not implemented"
            }
        }
    }
}

console.log(JSON.stringify(swagger_doc),Object.keys(swagger_doc.paths).length)