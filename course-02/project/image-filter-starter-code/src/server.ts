import express from 'express';
import {Application, Request, Response, NextFunction, Errback} from "express";
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  app.get("/filteredimage", async (req: Request, res: Response, next: NextFunction) => {

  // endpoint to filter an image from a public url.
  //    1. validate the image_url query
    const {image_url} = req.query;
    console.log(image_url)
    if (!image_url){
      return res.status(404).send("Resource not found.")
    }
    //    2. call filterImageFromURL(image_url) to filter the image
    try { 
      let imagePath = await filterImageFromURL(image_url) as string;
    
      //    3. send the resulting file in the response 
      return res.status(200).sendFile(imagePath, () => {
          deleteLocalFiles([imagePath]);
        });

    }
    catch(e){
      return next(e)
    }
  })  
  /**************************************************************************** */
  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();