import {useEffect, useState} from "react";

const transformData = (data) => {
    const countriesMap = {};

    data.forEach(item => {
        if (!countriesMap[item.country_id]) {
            countriesMap[item.country_id] = {
                name: item.country_name,
                exchanges: []
            };
        }
        countriesMap[item.country_id].exchanges.push({
            name: item.name,
            profit: `$ ${parseFloat(item.profit).toLocaleString('en-US', {maximumFractionDigits: 2})}`
        });
    });

    return Object.values(countriesMap);
};

function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [countries, setCountries] = useState([
        {
            name: 'XXXXXXX',
            exchanges: [
                {
                    name: 'XXXXXXXXX XX',
                    profit: '$ 8,888,888,888'
                }
            ],
        }
    ]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalBody, setModalBody] = useState('');

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    useEffect(() => {
        setIsLoading(true);

        Promise.all([
            fetch('http://localhost/top').then(res => res.json()),
            delay(500)
        ])
            .then(([payload]) => {
                const transformedData = transformData(payload);
                setCountries(transformedData);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                setIsLoading(false);
            });
    }, []);

    const handleFileSubmit = (event) => {
        event.preventDefault();

        const file = event.target.fileInput.files[0];
        if (!file) {
            alert("Please select a file to upload!");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        fetch('http://localhost/refresh', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.text())
            .then(data => {
                setModalBody(data.split('\n').map(x=> x+'<br\>').join(''));
                setModalVisible(true);
            })
            .catch(error => {
                console.error("Error uploading file:", error);
            });
    };

    return (
        <>
            <div className="container">

                <div className="center bg-secondary p-5 mt-2">
                    <div className="h1">Top Exchangers</div>
                </div>


                <div className="card mt-2">
                    <div className="card-header">
                        Response
                    </div>
                    <div className="card-body" dangerouslySetInnerHTML={{__html:modalBody}}/>
                </div>


                <div className="row mt-5">
                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-header">Refresh source?</div>
                            <div className="card-body">
                                <form onSubmit={handleFileSubmit}>
                                    <div className="input-group mb-3">
                                        <label className="input-group-text">
                                            <input type="file" className="form-control" name="fileInput"/>
                                        </label>
                                    </div>
                                    <button type="submit" className="btn btn-primary">Refresh!</button>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header">
                                Let's view leaders by country?
                                {isLoading ? <i className="float-end">loading...</i> : ''}
                            </div>
                            <div className="card-body">
                                <div className="accordion" id="accordionExample">
                                    {countries.map((country, idx) => (
                                        <div className="accordion-item" key={idx}>
                                            <h2 className="accordion-header">
                                                <button
                                                    className="accordion-button"
                                                    type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target={`#collapse${idx}`}
                                                    aria-expanded={idx === 0}
                                                    aria-controls={`collapse${idx}`}
                                                >
                                                    {country.name}
                                                </button>
                                            </h2>
                                            <div id={`collapse${idx}`}
                                                 className={`accordion-collapse collapse ${idx === 0 ? 'show' : ''}`}
                                                 data-bs-parent="#accordionExample">
                                                <div className="accordion-body">
                                                    <table className="table table-light table-striped">
                                                        <thead>
                                                        <tr>
                                                            <th scope="col">#</th>
                                                            <th scope="col">OFFICE</th>
                                                            <th scope="col">PROFIT</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {country.exchanges.map((exchange, exchangeIdx) => (
                                                            <tr key={exchangeIdx}>
                                                                <th scope="row">{exchangeIdx + 1}</th>
                                                                <td>{exchange.name}</td>
                                                                <td>{exchange.profit}</td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;
