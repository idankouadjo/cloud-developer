import express from 'express';
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
  app.get("/filteredimage", async (req, res) => {

  // endpoint to filter an image from a public url.
  //    1. validate the image_url query
    const {image_url} = req.query;
    console.log(image_url)
    if (!image_url){
      return res.status(404).send("Resource not found.")
    }
  //    2. call filterImageFromURL(image_url) to filter the image
    filterImageFromURL(image_url).then(
    
  //    3. send the resulting file in the response 
      result => {
        console.log(result)
        res.status(200).sendFile(result, () => {
  //    4. deletes any files on the server on finish of the response
          deleteLocalFiles([result]);
        });
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

      }
    )
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