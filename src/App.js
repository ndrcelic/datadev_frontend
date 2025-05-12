import React, {useEffect, useState} from "react";
import api from "./services/api"
import ListOfImages from "./components/ListOfImages";
import ImageUpload from "./components/UploadImage";
import DrawingLayer from "./components/DrawingLayer";

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
      <div style= {{display: 'flex'}}>
		<div style={{ width: '50%', padding: '1rem', marginLeft: "15%" }}>
			<ImageUpload onUpload={handleUpload} />
			<DrawingLayer selectedImage={selectedImage} setIsDrawing={setIsDrawing} />
		</div>
		<div style={{ width: '50%', padding: '1rem', marginRight: "20%" }}>
			<ListOfImages images={images} onSelect={setSelectedImage}  isDrawing={isDrawing} />
		</div>
	  </div>
    );
};

export default App;
