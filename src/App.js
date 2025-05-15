import React, {useEffect, useState} from "react";
import api from "./services/api"
import ListOfImages from "./components/ListOfImages";
import ImageUpload from "./components/UploadImage";
import DrawingLayer from "./components/DrawingLayer";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
	const [isDrawing, setIsDrawing] = useState(false);

    const fetchImages = async() => {
		try {
        	const response = await api.get('images');
        	setImages(response.data);
      	} catch (error) {
        	console.error("Error fetching image: ", error);
      	}
    };

    useEffect(() => {
		fetchImages();
    }, []);

    const handleUpload = async(file) => {
		if (!file) return alert ("Select an image, please!");
    	
		const formData= new FormData();
		formData.append("file", file);

		try {
			const response = await api.post("/images", formData, {
				Headers : {
					"Content-Type": "multipart/form-data",
				},
			});

			const image_id = response.data;
			alert(`Image has been uploaded! ID: ${image_id}`);
			fetchImages();
		}catch (err) {
            alert("Error during upload!");
        }
	};

    return (
	
	<div className="container row">
		<div className="col">
			<DrawingLayer selectedImage={selectedImage} setIsDrawing={setIsDrawing} />
		</div>
		<div className="col">
			<div className="container">
				<ImageUpload onUpload={handleUpload} className="row"/>
				<ListOfImages images={images} onSelect={setSelectedImage}  isDrawing={isDrawing} className="row"/>
			</div>
		</div>
	  </div>
    );
};

export default App;
