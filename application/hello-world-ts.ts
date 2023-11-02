import { response } from "@dirigible/http";

response.println(JSON.stringify({
    message: 'Hello World (TS)'
}));