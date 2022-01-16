var express = require("express");
const url = require('url');
var bodyParser = require("body-parser");
const Estudiante = require('./estudiantes');
const passport = require('passport');
const axios = require('axios').default;
const multer  = require('multer');
const { uploadFile, getFileStream, getTemporaryUrl } = require("./s3");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

//swagger documentation config
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const path = require("path");

const swaggerSpec = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Api de Estudiantes",
            version: "1.0.0"
        }/*,
        servers: [
            {
                url: "http://localhost:3000", 
                description: "Servidor de desarrollo en localhost"
            },
            {
                url: "https://api-usevilla-fis-2021-g4-juancarlosestradanieto.cloud.okteto.net/", 
                description: "Servidor de despliegue de Okteto"
            }
        ]*/
    },
    apis: [`${path.join(__dirname, "./server.js")}`]
};

require('./passport');

var BASE_API_PATH = "/apiestudiantes/v1";

var app = express();
//app.use(bodyParser.json());
app.use(passport.initialize());

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));


const upload = multer({ dest: 'uploads/' });

//swagger documentation config
app.use("/api-doc", swaggerUI.serve, swaggerUI.setup(swaggerJsDoc(swaggerSpec)));

/**
 * @swagger
 * components:
 *  schemas:
 *    Estudiante:
 *      type: object
 *      properties:
 *        identificacion:
 *          type: string
 *          description: La identificación del estudiante.
 *        nombre:
 *          type: string
 *          description: El nombre del estudiante.
 *      required:
 *        - identificacion
 *        - nombre
 *      example:
 *        identificacion: 999999
 *        nombre: John Doe
 * 
 *  securitySchemes:
 *    ApiKeyAuth:       # arbitrary name for the security scheme
 *      type: apiKey
 *      in: header       # can be "header", "query" or "cookie"
 *      name: apikey    # name of the header, query parameter or cookie
 *  
 *  responses:
 *    UnauthorizedError:
 *      description: API key es invalida o está ausente.
 *        
 */

app.get("/", (request, response) => {
    response.send("<html><body><h1>My Server.</h1></body></html>");
});

app.get(BASE_API_PATH+"/healthz", (request, response) => {
    response.sendStatus(200);
});

/**
 * @swagger
 * /apiestudiantes/v1/estudiantes:
 *    get:
 *      summary: Retorna todos los estudiante.
 *      tags: [Estudiante]
 *      responses:
 *        401: 
 *          $ref: '#/components/responses/UnauthorizedError'
 *        500: 
 *          description: Error al intentar consultar los estudiante.
 *        200: 
 *          description: Estudiantes consultados con éxito.
 *          content: 
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Estudiante'
 *      security:
 *        - ApiKeyAuth: []
 */
app.get(BASE_API_PATH+"/estudiantes",
    passport.authenticate("localapikey", {session: false}),
    (request, response) => {
    console.log(Date() + "GET - /estudiantes");

    Estudiante.find({}, function(error, resultados) {
        if(error)
        {
            console.log(Date() + " - "+error);
            response.sendStatus(500);
        }
        else
        {
            response.send(resultados.map((estudiante) => {
                return estudiante.limpiar();
            }));
        }
    });
});


/**
 * @swagger
 * /apiestudiantes/v1/estudiantes/{id}:
 *    get:
 *      summary: Retorna un estudiante al recibir un id válido.
 *      tags: [Estudiante]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          required: true
 *          description: Id del estudiante.
 *      responses:
 *        401: 
 *          $ref: '#/components/responses/UnauthorizedError'
 *        500: 
 *          description: Error al intentar consultar el estudiante.
 *        404: 
 *          description: Estudiante no encontrado.
 *        200: 
 *          description: Estudiante consultado con éxito.
 *          content: 
 *            application/json:
 *              schema:
 *                type: object
 *                $ref: '#/components/schemas/Estudiante'
 *      security:
 *        - ApiKeyAuth: []
 */
//obtener un estudiante por id
app.get(BASE_API_PATH+"/estudiantes/:id", 
    passport.authenticate("localapikey", {session: false}),
    (request, response) => {
    console.log(Date() + "GET - /estudiantes/"+request.params.id);

    Estudiante.findById(request.params.id).then((estudiante) => {
        if (!estudiante) {
            return response.status(404).send();
        }
        response.send(estudiante);
    })
    .catch((error) => {
        response.status(500).send(error);
    });
});

/**
 * @swagger
 * /apiestudiantes/v1/estudiantes.byIdentificacion/{identificacion}:
 *    get:
 *      summary: Retorna un estudiante al recibir una identificación válida.
 *      tags: [Estudiante]
 *      parameters:
 *        - in: path
 *          name: identificacion
 *          schema:
 *            type: string
 *          required: true
 *          description: Identificación del estudiante.
 *      responses:
 *        401: 
 *          $ref: '#/components/responses/UnauthorizedError'
 *        500: 
 *          description: Error al intentar consultar el estudiante.
 *        404: 
 *          description: Estudiante no encontrado.
 *        200: 
 *          description: Estudiante consultado con éxito.
 *          content: 
 *            application/json:
 *              schema:
 *                type: object
 *                $ref: '#/components/schemas/Estudiante'
 *      security:
 *        - ApiKeyAuth: []
 */
//obtener un estudiante por identificación
app.get(BASE_API_PATH+"/estudiantes.byIdentificacion/:identificacion", 
    passport.authenticate("localapikey", {session: false}),
    (request, response) => {
    console.log(Date() + "GET - /estudiantes.byIdentificacion/"+request.params.identificacion);

    Estudiante.findOne({identificacion: request.params.identificacion}).then((estudiante) => {
        if (!estudiante) {
            return response.status(404).send();
        }
        response.send(estudiante);
    })
    .catch((error) => {
        response.status(500).send(error);
    });
});


/**
 * @swagger
 * /apiestudiantes/v1/estudiantes:
 *    post:
 *      summary: Crea un nuevo estudiante
 *      tags: [Estudiante]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              $ref: '#/components/schemas/Estudiante'
 *      responses:
 *        401: 
 *          $ref: '#/components/responses/UnauthorizedError'
 *        409: 
 *          description: La identificación ya está registrada.
 *        400: 
 *          description: Error al intentar crear el estudiante.
 *        500: 
 *          description: Error al intentar crear el estudiante.
 *        201: 
 *          description: Estudiante creado.
 *      security:
 *        - ApiKeyAuth: []
 */

//el body llega vacío con postman pero funciona haciendo el post desde terminal
//curl -i -X POST "http://localhost:3000/apiestudiantes/v1/estudiantes" -H "Content-Type: application/json" -d "{\"identificacion\":\"444444\",\"nombre\":\"Perencejo\",\"editable\":true}"
app.post(BASE_API_PATH+"/estudiantes",
    passport.authenticate("localapikey", {session: false}),
    (request, response) => {
    console.log(Date() + "POST - /estudiantes");
    var estudiante = request.body;
    // console.log("estudiante");
    // console.log(estudiante);
    var filtro = {"identificacion": estudiante.identificacion};
    Estudiante.count(filtro, function (err, count) {
        //console.log(count);
        if(count > 0)
        {
            //response.sendStatus(500);
            //return response.status(409).send("La identificación ya está registrada.");
            //response.status(409);
            //return response.send("La identificación ya está registrada.");
            //return response.status(409).send('La identificación ya está registrada.');
            response.statusMessage = "La identificación ya está registrada.";
            response.status(409).end();
            return response;
        }
        else
        {
            Estudiante.create(estudiante, function(error) {
                if(error)
                {
                    console.log(Date() + " - "+error);

                    if(error.errors)
                    {
                        //console.log("error.errors");
                        //console.log(error.errors);
                        //console.log("error.message");
                        //console.log(error.message);
                        response.statusMessage = error.message;
                        response.status(400).end();
                        return response;
                    }

                    return response.sendStatus(500);
                }
                else
                {
                    //console.log("nuevoEstudiante");
                    //console.log(nuevoEstudiante);
                    //return response.status(201).send(nuevoEstudiante);

                    Estudiante.find(filtro, function(error, resultados) {
                        if(error)
                        {
                            console.log(Date() + " - "+error);
                            response.sendStatus(500);
                        }
                        else
                        {
                            response.status(201).send(resultados.map((estudiante) => {
                                return estudiante.limpiar();
                            }));
                        }
                    });
                }
            });
        }
    });

});

/**
 * @swagger
 * /apiestudiantes/v1/estudiantes/{id}:
 *    patch:
 *      summary: Actualiza un estudiante al recibir un id válido.
 *      tags: [Estudiante]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          required: true
 *          description: Id del estudiante.
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              $ref: '#/components/schemas/Estudiante'
 *      responses:
 *        401: 
 *          $ref: '#/components/responses/UnauthorizedError'
 *        500: 
 *          description: Error al intentar consultar el estudiante.
 *        404: 
 *          description: Estudiante no encontrado.
 *        409: 
 *          description: La identificación ya está registrada.
 *        200: 
 *          description: Estudiante actualizado con éxito.
 *          content: 
 *            application/json:
 *              schema:
 *                type: object
 *                $ref: '#/components/schemas/Estudiante'
 *      security:
 *        - ApiKeyAuth: []
 */
app.patch(BASE_API_PATH+"/estudiantes/:id", 
    passport.authenticate("localapikey", {session: false}),
    (request, response) => {
    console.log(Date() + "PATCH - /estudiantes");
    var id = request.params.id;
    var datos = request.body;
    // console.log("id "+id);
    // console.log("datos "+datos);

    Estudiante.count({"identificacion": datos.identificacion, _id: { $ne: id }}, function (err, count) {
        // console.log(count);
        if(count > 0)
        {
            //return response.status(409).send({message: "No se pudo guardar el cambio. Existe otro estudiante con esa identificación."});
            response.statusMessage = "No se pudo guardar el cambio. Existe otro estudiante con esa identificación.";
            response.status(409).end();
            return response;
        }
        else
        {
            Estudiante.findByIdAndUpdate(id, datos, {new: true})
            .then((estudiante) => {
                if (!estudiante) 
                {
                    return response.status(404).send();
                }
                response.send(estudiante);
            })
            .catch((error) => {
                response.status(500).send(error);
            });
        }
    });

});

/**
 * @swagger
 * /apiestudiantes/v1/estudiantes/{id}:
 *    delete:
 *      summary: Elimina un estudiante al recibir un id válido.
 *      tags: [Estudiante]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          required: true
 *          description: Id del estudiante.
 *      responses:
 *        401: 
 *          $ref: '#/components/responses/UnauthorizedError'
 *        500: 
 *          description: Error al intentar consultar el estudiante.
 *        404: 
 *          description: Estudiante no encontrado.
 *        200: 
 *          description: Estudiante eliminado con éxito.
 *          content: 
 *            application/json:
 *              schema:
 *                type: object
 *                $ref: '#/components/schemas/Estudiante'
 *      security:
 *        - ApiKeyAuth: []
 */
//obtener un estudiante por id
//obtener un estudiante por id
app.delete(BASE_API_PATH+"/estudiantes/:id",
    passport.authenticate("localapikey", {session: false}),
    (request, response) => {
    console.log(Date() + "DELETE - /estudiantes");
    // var estudiante_id = request.params.id;
    // console.log("estudiante_id");
    // console.log(estudiante_id);

    Estudiante.findByIdAndDelete(request.params.id).then((estudiante) => {
        if (!estudiante) {
            return response.status(404).send();
        }
        response.send(estudiante);
    }).catch((error) => {
        response.status(500).send(error);
    });
});

module.exports = app;
