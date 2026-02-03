import { useState } from 'react'
import './App.css'
import { useFetch } from './hooks/useFetch'

function App() {
  const baseUrl = "http://127.0.0.1:5000/api"
  const [ subCon, setSubCon ] = useState("")
  const [ cost, setCost ] = useState("")
  const [ temperature, setTemperature ] = useState("")
  const [ pH, setPh ] = useState("")
  const [ stabilityRes, setStabilityRes ] = useState("")
  const [ stabilityLoading, setStabilityLoading ] = useState(false)
  const { data, loading, error, setError, performFetch, clearData } = useFetch(baseUrl+ "/analyze")
  const [ batchData, setBatchData ] = useState([])
  const [ csvFile, setCsvFile ] = useState(null)
  const [ errs, setErrs ] = useState({})

  const handleInput = (e) => {
    const { name, value } = e.target;
    let errMessage = "";

    setErrs({})
 
    if(value === "") {
      errMessage = "";
    } else if (isNaN(value)) {
      errMessage = "Input shall be a number";
    } else if (Number(value <= 0) && name !== "temp") {
      errMessage = "Input shall be a positive number";
    } else if (Number(value > 14) && name === "pH") {
      errMessage = "Input shall be <= 14"
    }

    setErrs(prevErrs => ({
      ...prevErrs,
      [name]: errMessage
    }));

    if(name === "substrate-concentration") {
      setSubCon(value);
    } else if (name === "cost") {
      setCost(value);
    } else if (name === "temp") {
      setTemperature(value)
    } else if (name === "pH") {
      setPh(value)
    }
  };

  const handleCalculation = () => {
    const options = {
      body: {
        substrate_concentration: subCon,
        cost
      }
    }

    performFetch(options)
  };

  const fetchStabilityResult = async () => {
    setStabilityLoading(true)
    setError("")

    const body = {
      temperature,
      pH
    }

    try {
      const response = await fetch(baseUrl + "/stability", {
        method: "POST",
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify(body)
      })

      if(!response.ok) {
        throw new Error(`"Server Error": ${response.status}`)
      }

      const res = await response.json()

      setStabilityRes(res.result)
    } catch(e) {
      if(e.message === "Failed to fetch") {
        setError("Cannot connect to server")
      } else {
        setError(e.message)
      }
    } finally {
      setStabilityLoading(false)
    }
  }

  const handleReset = () => {
    setSubCon("");
    setCost("");
    setErrs({});
    clearData();
  }

  const handleStabilityReset = () => {
    setTemperature("")
    setPh("")
    setStabilityRes("")
    setErrs({})
    setError(null)
  }

  const handleFileChange = (e) => {
    if(e.target.files) setCsvFile(e.target.files[0])
  }

  const handleBatchUpload = async () => {
    if(!csvFile) return;
    const formData = new FormData()
    formData.append("file", csvFile)
    
    try {

      const response = await fetch(baseUrl + "/upload_csv", {
        method: "POST",
        body: formData
      })

      if(!response.ok) {
        throw new Error(`"Error": ${response.status}`)
      }

      const d = await response.json()

      if(d.results) setBatchData(d.results)

    } catch (e) {
      if(e.message === "Failed to fetch") {
        setError("Cannot connect to server.")
      } else {
        setError(e.message)
      }
    }
  }

  return (
    <div className="parent">
      {error && (
        <div className="error-banner"><strong>Error: </strong>{error}</div>
      )}
      <div className="dashboard">
        <div className="container">
          <h2>Biotech Efficiency Analyzer</h2>
          <div className="input-group">
            <label htmlFor="sub-con">Substrate Concentration</label>
            <input
              type="text"
              name="substrate-concentration"
              id="sub-con"
              value={subCon}
              onChange={handleInput}
              required
            />
            {errs["substrate-concentration"] && <p className="err">{errs["substrate-concentration"]}</p>}
          </div>
          <div className="input-group">
            <label htmlFor="cost">Cost</label>
            <input type="text" name="cost" id="cost" value={cost} onChange={handleInput} required/>
            {errs["cost"] && <p className="err">{errs["cost"]}</p>}
          </div>
          <button onClick={handleCalculation} disabled={!subCon || !cost}>Calculate</button>
          <button onClick={handleReset} disabled={!subCon || !cost}>Reset</button>

          {data && !loading && <div className="results">
            <h2>Results</h2>
            <p>Velocity: {data.velocity}</p>
            <p>Efficiency: {data.efficiency}</p>
          </div>}
        </div>
        <div className="container">
          <h2>Protein Stability Check</h2>
          <div className="input-group">
            <label htmlFor="">Temperature (Celsius)</label>
            <input type="text" name="temp" id="temp" value={temperature} onChange={handleInput}/>
            {errs["temp"] && <p className="err">{errs["temp"]}</p>}
          </div>
          <div className="input-group">
            <label>pH</label>
            <input type="text" name="pH" id="pH" value={pH} onChange={handleInput}/>
            {errs["pH"] && <p className="err">{errs["pH"]}</p>}
          </div>
          <button onClick={fetchStabilityResult} disabled={!temperature || !pH}>Query</button>
          <button onClick={handleStabilityReset} disabled={!temperature || !pH}>Reset</button>
          {stabilityRes && !stabilityLoading && <div className="results">
            <h2>Result</h2>
            <p>{stabilityRes}</p>
          </div>}
        </div>
        <div className="container">
          <h2>Batch Analysis</h2>
          <input type="file" onChange={handleFileChange}/>
          <button onClick={handleBatchUpload}>Upload</button>
          <ul>
            {batchData.map((row, i) => (
              <li key={i}> {row["s"]}, {row["c"]}, {row["eff"]}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
