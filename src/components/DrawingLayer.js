import React, {useEffect, useRef, useState} from 'react';
import api from "../services/api"

function DrawingLayer ({selectedImage, setIsDrawing})  {
    const canvasRef = useRef();
    const [mode, setMode] = useState('u');  // undefined
    
    const [isDrawingBox, setIsDrawingBox] = useState(false)
    const [startPos, setStartPos] = useState(null);
    const [currentPos, setCurrentPos] = useState(null);
    const [boxArray, setBoxArray] = useState([])

    const [isDrawingPolygon, setIsDrawingPolygon] = useState(false)
    const [polyPoints, setPolyPoints] = useState([]);
    const [isFinishedPolygon, setIsFinishedPolyon] = useState(false);
    const [polygonArrray, setPolygonArray] = useState([])

    const [saveButtonEnabled, setSaveButtonEnabled] = useState(false);

    const [allAnnotations, setAllAnnotations] = useState(null)

    const [description, setDescription] = useState("")

    const [undo, setUndo] = useState([]);
    const [redo, setRedo] = useState([]);

    const canvasWidth = 600;
    const canvasHeight = 300;

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

                
                boxArray.forEach((obj) => {
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
                });

                if (currentPos) {
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(currentPos.x, currentPos.y, currentPos.width, currentPos.height);
                }

                polygonArrray.forEach((obj) => {
                    obj.forEach(({x, y}) => {
                        ctx.beginPath();
                        ctx.arc(x, y, 3, 0, 2* Math.PI);
                        ctx.fillStyle = 'blue';
                        ctx.fill();
                    });

                    obj.forEach(({x, y}, index) => {
                        if (index === 0) {
                            ctx.beginPath();
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    });

                    ctx.lineTo(obj[0].x, obj[0].y);

                    ctx.strokeStyle = 'blue';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                });


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

    }, [selectedImage, currentPos, boxArray, polyPoints, isFinishedPolygon, polygonArrray, allAnnotations])


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
        setSaveButtonEnabled(false);
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
    };

    const handleMouseUp = (e) => {
        if (!selectedImage || mode === 'p') return;
        if (mode === 'u') {
            alert("Please choose a mode!")
            return;
        }
        setIsDrawingBox(false);
        setSaveButtonEnabled(true);
        setIsDrawing(true);
        const newBox = [...boxArray, currentPos];
        setBoxArray(newBox);
        
        setUndo(prev => [...prev, 'b']);
        setRedo([]);
    };

    const handleSaveButtonButton = async () => {
        const payload = []

        if (boxArray.length > 0) {
            boxArray.forEach((newBox) => {
                payload.push({
                    type: "box",
                    x: newBox.x,
                    y: newBox.y,
                    w: newBox.width,
                    h: newBox.height,
                    description: description,
                })

            })
        }

        if (polygonArrray.length > 0) {
            polygonArrray.forEach((newPolygon) => {
                const formattedPoints = newPolygon.map(point => [point.x, point.y])
                payload.push({
                    type: "polygon",
                    points: formattedPoints,
                    description: description,
                })
            })
        }

        try {
            const response = await api.post(`images/${selectedImage.id}/annotations`, payload);
            setSaveButtonEnabled(false);
            setIsDrawing(false);
            setCurrentPos(null);
            setMode('u');
            setDescription("");
            setBoxArray([]);
            setPolygonArray([]);
            setUndo([]);
            setRedo([]);
            alert("Annotations successfully saved!", response.data);
        } catch (error){
            alert("Error during upload annotations!")
        }
    };

    const handlePolygonClick = (e) => {
        if (!selectedImage || mode === 'b') return;
        if (mode === 'u') {
            alert("Please choose a mode!")
            return;
        }

        const canvas = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - canvas.left;
        const y = e.clientY - canvas.top;
        setIsFinishedPolyon(false);
        setSaveButtonEnabled(false);
        setIsDrawing(true);
        setIsDrawingPolygon(true);

        const newPoints = [...polyPoints, {x, y}]
        setPolyPoints(newPoints)
        setUndo(prev => [...prev, 'c']);
        setRedo([]);
    };

    const handleFinishPolygon = async () => {
        setIsFinishedPolyon(true);
        setSaveButtonEnabled(true);
        setIsDrawingPolygon(false);

        setPolygonArray(prev => [...prev, polyPoints]);
        setPolyPoints([]);
        setUndo(prev => [...prev, 'p']);
        setRedo([]);
    };

    const handleClearAll = async() => {
        setCurrentPos(null);
        setPolyPoints([]);
        setSaveButtonEnabled(false);
        setIsDrawing(false);
        setIsDrawingBox(false);
        setIsDrawingPolygon(false);
        setMode('u');
        setDescription("");
        setIsFinishedPolyon(false);
        setAllAnnotations(null);
        setBoxArray([]);
        setPolygonArray([]);
        setUndo([]);
        setRedo([]);
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
            setUndo([]);
        } catch (error) {
            alert("Error durring get annotations!", error)
        }
    };

    const handleDescription = (event) => {
        if (event.target.value.length <= 200) {
            setDescription(event.target.value);
        }
    };

    const handleUndo = async () => {
        const lastOpp = undo.pop();

        if (lastOpp === 'c') {
            const newCoordinates = [...polyPoints];
            const coordinate = newCoordinates.pop();
            setPolyPoints(newCoordinates);
            setRedo(prev => [...prev, [coordinate, lastOpp]]);
            if (newCoordinates.length === 0) {
                setIsDrawingPolygon(false);
            }
        }

        if (lastOpp === 'p') {
            const newPolygonArray = [...polygonArrray];
            const pol = newPolygonArray.pop();
            const formated = undo.filter(item => item !== 'c');
            setUndo(formated);
            setPolygonArray(newPolygonArray);
            setRedo(prev => [...prev, [pol, lastOpp]]);
            setPolyPoints([]);
            
            if (formated.length === 0) {
                setSaveButtonEnabled(false);
            }
        }

        if (lastOpp === 'b') {
            const newBoxArray = [...boxArray]
            const box = newBoxArray.pop();
            setBoxArray(newBoxArray);
            setCurrentPos(null);
            setRedo(prev => [...prev, [box, lastOpp]]);
        }

        if (undo.length === 0) {
            setSaveButtonEnabled(false);
        }
    };

    const handleRedo = async () => {
        if (redo.length <= 0) return;

        const lastOppObj = redo.pop();
        
        if (lastOppObj[1] === 'c') {
            setPolyPoints(prev => [...prev, lastOppObj[0]]);
            setUndo(prev => [...prev, 'c']);
        }

        if (lastOppObj[1] === 'p') {
            setPolygonArray(prev => [...prev, lastOppObj[0]]);
            setUndo(prev => [...prev, 'p'])
        }

        if (lastOppObj[1] === 'b') {
            setBoxArray(prev => [...prev, lastOppObj[0]]);
            setUndo(prev => [...prev, 'b'])
        }

        setSaveButtonEnabled(true);
    };

    return (
        <div>
            <div>
                <div className="container mt-4">
                    <div className="d-flex justify-content-end gap-1 mb-3">
                        <button className="btn btn-outline-primary" onClick={handleGetAnnotations} style = {{marginLeft: '5em'}} disabled={!selectedImage || mode !== 'u'}>Get All Annotations</button>
                        <button className="btn btn-outline-primary" onClick={handleDownloadJSON} style = {{marginLeft: '5em'}} disabled={!selectedImage}>EXPORT</button>
                    </div>
                    <div className="d-flex flex-wrap gap-3">
                        <button className="btn btn-outline-primary" onClick={() => {setMode('b'); setAllAnnotations(null)}} style = {{ marginLeft: '20px'}} disabled={!selectedImage || isDrawingPolygon}>Draw Box</button>
                        <button className="btn btn-outline-primary" onClick={() => {setMode('p'); setAllAnnotations(null)}} style = {{ marginLeft: '30px'}} disabled={!selectedImage || isDrawingBox}>Draw Polygon</button>
                        <button className="btn btn-outline-primary" onClick={handleClearAll} style = {{ marginLeft: '30px'}}>Clear All</button>
                    </div>
                </div>

                <div className="d-flex align-items-center mt-4 ml-4 flex-wrap gap-3">
                    <div className="d-flex gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={handleUndo} disabled={undo.length === 0}>UNDO</button>
                        <button className="btn btn-secondary btn-sm" onClick={handleRedo} disabled={redo.length === 0}>REDO</button>
                    </div>

                    <div className="d-flex flex-column align-items-center mt-2">
                        <h4 className="mb-2 ml-4">Selected Image: {selectedImage ? selectedImage.id : ""}</h4>
                        <div>
                            <span className="ml-4">Current selection:&nbsp;&nbsp;</span>
                            {mode === 'p' && <strong>POLYGON</strong>}
                            {mode === 'b' && <strong>BOX</strong>}
                            {mode === 'u' && <strong>NOT SELCTED</strong>}
                        </div>
                    </div>
                </div>

                <canvas ref={canvasRef} style={{border: '2px solid #ccc'}} width="600" height="300"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onClick={handlePolygonClick}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start'}}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' , marginTop: '20px'}}>
                        <button className="btn btn-success" disabled={!saveButtonEnabled} style={{ marginTop: '1rem'}} onClick={handleSaveButtonButton}>
                            Save shape
                        </button>
                        {mode === 'p' && (
                            <button className="btn btn-info" disabled={!selectedImage || !isDrawingPolygon || polyPoints.length < 3} style={{ marginLeft: '10rem', marginTop: '1rem'}}
                                onClick={handleFinishPolygon}
                            >Finish and View Polygon</button>
                        )}
                    </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start'}}>
                    <div>
                        {currentPos &&  mode === 'b' && (
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
                        {polyPoints.length > 0 && mode === 'p' && isDrawingPolygon && (
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
                            <pre style={{marginTop: '1rem', textAlign: "left"}}>
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
