import bodyParser from "body-parser";

export const bodyParserJson = bodyParser.json();
export const bodyParserUrlEncoded = bodyParser.urlencoded({ extended: false });
