import React from "react";

function ListOfImages  ({images, onSelect, isDrawing})  {
    return (
        // <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "20px", alignContent: "center" }}>
            <div className="col d-flex flex-column align-items-center justify-content-center">
            <h3 className="text-center mt-5">Images</h3>
            {images.map((img) => (
                <div key={img.id} style={{ width: "200px", textAlign: "center" }}>
                    <img
                        key={img.id}
                        src={img.row_image}
                        alt={`Image_id ${img.id}`}
                        style={{ width: "100%", height: "auto", objectFit: "cover", cursor: isDrawing ? "not-allowed" : "pointer" }}
                        // className={`img-fluid object-fit-cover ${isDrawing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={() => !isDrawing && onSelect(img)}
                    />
                    <p style={{ wordBreak: "break-all", fontSize: "0.9em"}}>Id: {img.id}</p>
                </div>
            ))}
        </div>
    );
};

export default ListOfImages;