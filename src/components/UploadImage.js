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
        <div className="mt-4">
            <h3 className="ms-5">Upload Image</h3>
            <div className="d-flex gap-5 ms-5">
                <input type="file" accept="image/*" ref={imageInputRef} className="form-control col"/>
                <button onClick={handleImageChange} className="btn btn-primary">UPLOAD</button>
            </div>
        </div>
    );
};

export default ImageUpload;