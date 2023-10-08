import React, { useState, useEffect } from 'react';
import './App.css';
import CustomTable, { Paginated } from './components/CustomTable';

interface MovieData {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

const columnNames = ['imdbID', 'Title', 'Year', 'Type'];

const fetchData = async (page: number): Promise<Paginated<MovieData[]>> => {
  try {
    const response = await fetch(`https://www.omdbapi.com/?s=father&apikey=ce554ad3&page=${page}`);
    const data = await response.json();
    const limit=10
    return {
      data: data.Search,
      total: data.totalResults,
      skip: limit * (page - 1),
      take: limit,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Rethrow the error for handling at a higher level
  }
};

function App() {
  const [dataPromise, setDataPromise] = useState<Promise<Paginated<MovieData[]>> | null>(null);

  useEffect(() => {
    const fetchDataPromise = fetchData(1);
    setDataPromise(fetchDataPromise);

    // Optionally handle errors when the initial data promise is rejected
    fetchDataPromise.catch((error) => console.error('Error setting initial data:', error));
  }, []);

  const handlePageChange = (page: number) => {
    const newDataPromise = fetchData(page);
    setDataPromise(newDataPromise);

    // Optionally handle errors when the new data promise is rejected
    newDataPromise.catch((error) => console.error('Error fetching new data:', error));
  };

  return (
    <div className="App">
      <CustomTable
        columnNames={columnNames}
        data={dataPromise}
        enableRowSelection={true}
        customHeader={<h1 className='bold'>Custom Table Header</h1>}
        paginate={handlePageChange}
      />
    </div>
  );
}

export default App;
