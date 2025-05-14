import React, {useEffect, useRef, useState} from 'react';
import api from "../services/api"

function DrawingLayer ({selectedImage, setIsDrawing})  {
    const canvasRef = useRef();
    const [mode, setMode] = useState('u');  // undefined
    
    const [isDrawingBox, setIsDrawingBox] = useState(false)
    const [startPos, setStartPos] = useState(null);
    const [currentPos, setCurrentPos] = useState(null);

    const [isDrawingPolygon, setIsDrawingPolygon] = useState(false)
    const [polyPoints, setPolyPoints] = useState([]);
    const [isFinishedPolygon, setIsFinishedPolyon] = useState(false);

    const [saveButtonEnabled, setSaveButtonEnabled] = useState(false);

    const [allAnnotations, setAllAnnotations] = useState(null)

    const [description, setDescription] = useState("")

    const canvasWidth = 600;
    const canvasHeight = 300;

    //const drawing = (box = null, polygon = null, isFinishedPolygon) => {
    useEffect(() => {
        if (selectedImage && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);

                const imgAspect = img.width / img.height;
                const canvasAspect = canvasWidth / canvasHeight;

                let drawWidth, drawHeight;

                if (imgAspect > canvasAspect) {
                    drawWidth = canvasWidth;
                    drawHeight = canvasWidth / imgAspect;
                } else {
                    drawHeight = canvasHeight;
                    drawWidth = canvasHeight * imgAspect;
                }

                ctx.drawImage(img, 0, 0, drawWidth, drawHeight)

                if (currentPos) {
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(currentPos.x, currentPos.y, currentPos.width, currentPos.height);
                }
                if (polyPoints && polyPoints.length > 0) {
                    polyPoints.forEach(({x, y}) => {
                        ctx.beginPath();
                        ctx.arc(x, y, 3, 0, 2* Math.PI);
                        ctx.fillStyle = 'blue';
                        ctx.fill();
                    });

                    if (isFinishedPolygon) {
                        ctx.beginPath();
                        ctx.moveTo(polyPoints[0].x, polyPoints[0].y);

                        polyPoints.forEach(({x, y}) =>{
                            ctx.lineTo(x, y);
                        });

                        ctx.lineTo(polyPoints[0].x, polyPoints[0].y);
                        
                        ctx.strokeStyle = 'blue';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }

                if (allAnnotations) {
                    const boxes = allAnnotations.boxes;
                    const polygons = allAnnotations.polygons;;

                    boxes.forEach((obj) => {
                        ctx.strokeStyle = 'red';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(obj.x_point, obj.y_point, obj.width, obj.height);
                    });

                    
                    polygons.forEach((obj) => {
                        obj.points.forEach(({x_point, y_point}) => {
                            ctx.beginPath();
                            ctx.arc(x_point, y_point, 3, 0, 2* Math.PI);
                            ctx.fillStyle = 'blue';
                            ctx.fill();
                        });

                        obj.points.forEach(({x_point, y_point}, index) => {
                            if (index === 0) {
                                ctx.beginPath();
                                ctx.moveTo(x_point, y_point);
                            } else {
                                ctx.lineTo(x_point, y_point);
                            }
                        });

                        ctx.lineTo(obj.points[0].x_point, obj.points[0].y_point);

                        ctx.strokeStyle = 'blue';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    });
                }
            }

            img.src= selectedImage.row_image;
        } else return;

    }, [selectedImage, currentPos, polyPoints, isFinishedPolygon, allAnnotations])


    const handleMouseDown = (e) => {
        if (!selectedImage || mode === 'p') return;
        if (mode === 'u') {
            alert("Please choose a mode!")
            return;
        }

        const box = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - box.left;
        const y = e.clientY - box.top;

        setStartPos({x, y});
        setIsDrawingBox(true);
    };

    const handleMouseMove = (e) => {
        if (!selectedImage || !isDrawingBox || !startPos || mode === 'p') return;
        if (mode === 'u') {
            alert("Please choose a mode!")
            return;
        }

        const box = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - box.left;
        const y = e.clientY - box.top;
        
        const width = x - startPos.x;
        const height = y - startPos.y;

        const boxCurrently = {
            x: startPos.x,
            y: startPos.y,
            width,
            height,
        };

        setCurrentPos(boxCurrently);
        // drawing(boxCurrently, null, isFinishedPolygon, null);
        
    };

    const handleMouseUp = (e) => {
        if (!selectedImage || mode === 'p') return;
        if (mode === 'u') {
            alert("Please choose a mode!")
            return;
        }
        setIsDrawingBox(false);
        // drawing(currentPos, null, isFinishedPolygon, null);
        setSaveButtonEnabled(true);
        setIsDrawing(true);   
    };

    const handleSaveButtonButton = async () => {
        if (mode === 'b') {
            if (!currentPos) return;
            const payload = {
                type: "box",
                x: currentPos.x,
                y: currentPos.y,
                w: currentPos.width,
                h: currentPos.height,
                description: description,
            };

            try {
                const response = await api.post(`images/${selectedImage.id}/annotations`, payload);
                setSaveButtonEnabled(false);
                setIsDrawing(false);
                setCurrentPos(null);
                // drawing(null, null, isFinishedPolygon, null);
                setMode('u');
                setDescription("");
                alert("Box annotations successfully saved!", response.data);
            } catch (error){
                alert("Error during upload annotations!")
            }
        }

        if (mode === 'p' && isFinishedPolygon) {
            if (polyPoints.length < 3) return

            const formattedPoints = polyPoints.map(point => [point.x, point.y])

            const payload = {
                type: "polygon",
                points: formattedPoints,
                description: description,
            };

            try {
                const response = await api.post(`images/${selectedImage.id}/annotations`, payload);
                setSaveButtonEnabled(false);
                setIsDrawing(false);
                setPolyPoints([]);
                setIsFinishedPolyon(false);
                // drawing(null, null, isFinishedPolygon, null);
                setMode('u');
                setDescription("");
                alert("Polygon annotations successfully saved!", response.data);
            } catch (error){
                alert("Error during upload annotations!")
            }
        }
    };

    const handlePolygonClick = (e) => {
        if (!selectedImage || mode === 'b' || isFinishedPolygon) return;
        if (mode === 'u') {
            alert("Please choose a mode!")
            return;
        }

        const canvas = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - canvas.left;
        const y = e.clientY - canvas.top;

        setIsDrawing(true);
        setIsDrawingPolygon(true);

        const newPoints = [...polyPoints, {x, y}]
        setPolyPoints(newPoints)
        // drawing(currentPos, newPoints, isFinishedPolygon, null);

    };

    const handleFinishPolygon = async () => {
        setIsFinishedPolyon(true);
        // drawing(currentPos, polyPoints, isFinishedPolygon, null);
        setSaveButtonEnabled(true);
        setIsDrawingPolygon(false);

    };

    const handleClearAll = async() => {
        setCurrentPos(null);
        setPolyPoints([]);
        // drawing(null, null, isFinishedPolygon, null);
        setSaveButtonEnabled(false);
        setIsDrawing(false);
        setIsDrawingBox(false);
        setIsDrawingPolygon(false);
        setMode('u');
        setDescription("");
        setIsFinishedPolyon(false);
        setAllAnnotations(null);
    };

    const handleDownloadJSON = async () => {
        if(!selectedImage) return;

        try{
            const response = await api.get(`images/${selectedImage.id}/download_annotations`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const element = document.createElement("a");
            element.href = url;
            element.download = `image_${selectedImage.id}.json`;
            document.body.appendChild(element);
            element.click();

            window.URL.revokeObjectURL(url);

        } catch (error) {
            alert("Error during download!")
        }
    };

    const handleGetAnnotations = async () => {
        if(!selectedImage) return;

        try {
            const response = await api.get(`images/${selectedImage.id}/annotations`);
            setAllAnnotations(response.data);
            setIsDrawing(true);
            // drawing(null, null, false, allAnnotations);
            

        } catch (error) {
            alert("Error durring get annotations!", error)
        }
    };

    const handleDescription = (event) => {
        if (event.target.value.length <= 200) {
            setDescription(event.target.value);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start'}}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' , marginTop: '20px'}}>
                    <button onClick={() => {setMode('b'); setAllAnnotations(null)}} style = {{ marginLeft: '20px'}} disabled={!selectedImage || saveButtonEnabled || isDrawingPolygon}>Draw Box</button>
                    <button onClick={() => {setMode('p'); setAllAnnotations(null)}} style = {{ marginLeft: '30px'}} disabled={!selectedImage || isDrawingPolygon || saveButtonEnabled}>Draw Polygon</button>
                    <button onClick={handleClearAll} style = {{ marginLeft: '30px'}}>Clear All</button>
                    <button onClick={handleGetAnnotations} style = {{marginLeft: '5em'}} disabled={!selectedImage || mode !== 'u'}>Get All Annotations</button>
                    <button onClick={handleDownloadJSON} style = {{marginLeft: '5em'}} disabled={!selectedImage}>Download JSON</button>
                </div>
                <h3>Selected Image: {selectedImage ? selectedImage.id : ""}</h3>
                {mode === 'p' ? <label>POLYGON</label> : null}
                {mode === 'b' ? <label>BOX</label> : null}
                <canvas ref={canvasRef} style={{border: '1px solid #ccc'}}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onClick={handlePolygonClick}
                />
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' , marginTop: '20px'}}>
                    <button disabled={!saveButtonEnabled} style={{ marginTop: '1rem'}} onClick={handleSaveButtonButton}>
                        Save shape
                    </button>
                    {mode === 'p' && (
                        <button disabled={!selectedImage || !isDrawingPolygon || polyPoints.length < 3} style={{ marginLeft: '10rem', marginTop: '1rem'}}
                            onClick={handleFinishPolygon}
                        >Finish and View Polygon</button>
                    )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start'}}>
                    <div>
                        {currentPos &&  (
                            <table style={{ borderCollapse: 'collapse', marginTop: '1rem'}}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '4px 8px' }}><strong>X point: </strong></td>
                                        <td style={{ padding: '4px 8px' }}>{currentPos.x.toFixed(4)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '4px 8px' }}><strong>Y point: </strong></td>
                                        <td style={{ padding: '4px 8px' }}>{currentPos.y.toFixed(4)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '4px 8px' }}><strong>Width: </strong></td>
                                        <td style={{ padding: '4px 8px' }}>{currentPos.width}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '4px 8px' }}><strong>Height: </strong></td>
                                        <td style={{ padding: '4px 8px' }}>{currentPos.height}</td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                        {polyPoints.length > 0 && (
                            <table border={1} style = {{marginTop: '1rem'}}>
                                <thead>
                                    <tr>
                                        <th>X point</th>
                                        <th>Y point</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {polyPoints.map((point, index) =>
                                        <tr key={index}>
                                            <td>{point.x.toFixed(4)}</td>
                                            <td>{point.y.toFixed(4)}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                        {allAnnotations && (
                            <pre style={{marginTop: '1rem'}}>
                                <code>
                                    {JSON.stringify(allAnnotations, null, 2)}
                                </code>
                            </pre>
                        )}
                    </div>

                    {saveButtonEnabled && (
                        <div style={{marginTop: '3em', marginLeft: '7em'}}>
                            <textarea
                                value={description}
                                onChange={handleDescription}
                                placeholder='Input description (max 200 characters)'
                                rows='3'
                                // cols="40"
                            />
                            <p>{description.length} / 200 charackters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DrawingLayer;
