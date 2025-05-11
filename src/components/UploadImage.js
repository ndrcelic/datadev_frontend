import React, {useRef} from "react";

function ImageUpload ({onUpload}) {
    const imageInputRef = useRef();

    const handleImageChange = () => {
        const image = imageInputRef.current.files[0];
        if (image) {
            onUpload(image);
            imageInputRef.current.value = null;
        }
    };

    return (
        <div>
            <h3>Upload Image</h3>
            <input type="file" accept="image/*" ref={imageInputRef} />
            <button onClick={handleImageChange}>SEND</button>
        </div>
    );
};

export default ImageUpload;