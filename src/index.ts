import * as functions from 'firebase-functions';
import * as firebase from 'firebase';
import { isString, isNullOrUndefined, isNumber, isBoolean, log, error} from 'util';

export const check = function(arg: object){
    return !isNullOrUndefined(arg) &&
    (isString(arg) && arg.length > 0) || isNumber(arg) || isBoolean(arg)
};

export const checks = function(...args: object[]){
    for (const arg of args) if(!check(arg)) return false;
    return true;
}

class Payload{
    public status: number;
    public message: string;
    public data: any;

    constructor (status: number, message: string)
    {
        this.status = status;
        this.message = message;
    }

    setData(data: any) : Payload {
        this.data = data;
        return this;
    }

    public static with(status: number, message: string) : Payload {
        return new Payload(status, message);
    }

    public static withs(status: number, message: string, data: any) : Payload {
        return new Payload(status, message).setData(data);
    }

    public static error(status: number, message: string) : Payload {
        let p = new Payload(status, message);
        error(p);
        return p;
    }

    public static errors(status: number, message: string, data: any) : Payload {
        let p = new Payload(status, message).setData(data);
        error(p);
        return p;
    }
}

exports.ping = functions.https.onRequest((req, resp) => resp.status(200).send("pong"));
exports.login = functions.https.onRequest((request, response) => {
 if(request.method == "POST"){
     if(isNullOrUndefined(request.body) || isNullOrUndefined(request.body.app) || isNullOrUndefined(request.body.data)){
         response.status(400).send(Payload.error(400, "invalid.request.body")).end();
         return;
     }

    let apiKey = request.body.app.apiKey;
    let projectId = request.body.app.projectId;
    let messagingSenderId = request.body.app.messagingSenderId;
    let authDomain = request.body.app.authDomain;

    if(checks(apiKey, projectId, messagingSenderId, authDomain))
    {
        let identity = request.body.data.identity;
        let password = request.body.data.password;
        if(checks(identity, password))
        {
            var app;
            try
            {
                app = firebase.app(projectId);
            }
            catch(e)
            {
                let config = {
                    apiKey: apiKey,
                    projectId: projectId,
                    authDomain: authDomain,
                    messagingSenderId: messagingSenderId,
                };

                app = firebase.initializeApp(config, projectId);
                log("Init new App with name: " + projectId);
            }

            log("Processing Request from: " + projectId + ":" + apiKey);
            app.auth().signInWithEmailAndPassword(identity, password)
				.then((result) => {
                    response.status(200).send(result).end();
				})
				.catch((e) => {
                    response.status(400).send(Payload.error(400, e.message)).end();
				});
        }
        else
        {
            let data = Array();

            if(!check(identity))
                data.push("identity (string) is null or invalid type, value: " + identity);
            if(!check(password))
                data.push("password (string) is null or invalid type, value: " + password);

            response.status(400).send(Payload.errors(400, "invalid.request", data)).end();
        }
    }
    else
    {
        let data = Array();
        if(!check(apiKey))
            data.push("apiKey (string) is null or invalid type, value: " + apiKey);
        if(!check(projectId))
            data.push("projectId (string) is null or invalid type, value: " + projectId);
        if(!check(messagingSenderId))
            data.push("messagingSenderId (integer) is null or invalid type, value: " + messagingSenderId);
        if(!check(authDomain))
            data.push("authDomain (string) is null or invalid type, value: " + authDomain);

        response.status(400).send(Payload.errors(400, "invalid.request", data));
    }
 }
 else
 {
     response.status(404).send(Payload.error(404, "route.not.found")).end();
 }
});
