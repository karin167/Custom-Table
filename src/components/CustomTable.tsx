import React, { useState, useEffect } from 'react';

export interface Paginated<T> {
    data: Array<T>;
    total: number;
    skip: number;
    take: number;
}

interface CustomTableProps<T> {
    columnNames: string[];
    customHeader?: React.ReactNode;
    data: Promise<Paginated<T>> | null;
    enableRowSelection?: boolean;
    paginate: (page: number) => void;
     maxVisiblePaginationButtons?:number ;

}

const CustomTable = <T extends object>({
    columnNames,
    customHeader,
    data,
    enableRowSelection = false,
    paginate,
    maxVisiblePaginationButtons =3
}: CustomTableProps<T>) => {
    const [selectedRows, setSelectedRows] = useState<T[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [tableData, setTableData] = useState<Paginated<T>>({
        data: [],
        skip: 0,
        take: 0,
        total: 0,
    });

    const [showPopup, setShowpop] = useState(false)
    const fetchData = async () => {
        if (data) {
            try {
                const resolvedData = await data;
                setTableData(resolvedData);
                setCurrentPage(Math.floor(resolvedData.skip / resolvedData.take) + 1);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

    };
    useEffect(() => {
        fetchData();
    }, [data]);

    const handleRowSelection = (row: T) => {
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.includes(row)
                ? prevSelectedRows.filter((selectedRow) => selectedRow !== row)
                : [...prevSelectedRows, row]
        );
    };

    const evaluateSelectedRows = () => {
        setShowpop(true);
    };

    const handlePageChange = (newPage: number) => {
        setSelectedRows([]);
        paginate(newPage);
    };



    // Calculate the total number of pages
    const totalPages = Math.ceil(tableData.total / tableData.take);


    // Calculate the range of visible page buttons
    let startPage = currentPage - Math.floor(maxVisiblePaginationButtons / 2);
    let endPage = currentPage + Math.floor(maxVisiblePaginationButtons / 2);

    // Ensure that the range stays within valid page numbers
    if (startPage < 1) {
        startPage = 1;
        endPage = Math.min(totalPages, maxVisiblePaginationButtons);
    }
    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePaginationButtons + 1);
    }

    return (
        <div>
            {customHeader && <div>{customHeader}</div>}
            {enableRowSelection && (
                <div className="flex justify-end">

                    <>
                        <button onClick={evaluateSelectedRows} disabled={!selectedRows.length}
                            className={`rounded px-4 py-2 ${!selectedRows.length
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}>
                            show selected rows</button>
                        <Popup isOpen={showPopup} onClose={function (): void {
                            setShowpop(false)
                        }} jsonString={JSON.stringify(selectedRows)}></Popup>
                    </>
                </div>

            )}

            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        {enableRowSelection && (
                            <th className="px-6 py-4">
                                <input
                                    type="checkbox"
                                    checked={selectedRows.length === tableData.data.length}
                                    onChange={() => {
                                        if (selectedRows.length === tableData.data.length) {
                                            setSelectedRows([]);
                                        } else {
                                            setSelectedRows([...tableData.data]);
                                        }
                                    }}
                                />
                            </th>
                        )}
                        {columnNames.map((columnName, index) => (
                            <th key={index} className="px-6 py-3">
                                {columnName}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData.data.map((row, index) => (
                        <tr key={index} className="bg-white border-b">
                            {enableRowSelection && (
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.includes(row)}
                                        onChange={() => handleRowSelection(row)}
                                    />
                                </td>
                            )}
                            {columnNames.map((columnName: string, index) => (
                                <td key={index} className="px-6 py-4">
                                    {(row as any)[columnName]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination flex items-center justify-between mt-4">
                <div className="flex-1 text-sm text-gray-700 text-left">
                    Showing {tableData.skip + 1} to{' '}
                    {Math.min(tableData.skip + tableData.take, tableData.total)} of{' '}
                    {tableData.total}
                </div>
                <div className="space-x-2">
                    <button
                        className={`px-4 py-2 ${currentPage === 1
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                            } rounded-l`}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    {/* Render first page button */}
                    {startPage > 1 && (
                        <button
                            className={`px-4 py-2 bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white`}
                            onClick={() => handlePageChange(1)}
                        >
                            1
                        </button>
                    )}
                    {/* Render "..." if there are more pages to the left */}
                    {startPage > 2 && (
                        <span className="px-2 py-2 text-gray-700">...</span>
                    )}
                    {/* Render numbered buttons within the visible range */}
                    {Array.from({ length: endPage - startPage + 1 }).map((_, index) => (
                        <button
                            key={index}
                            className={`px-4 py-2 ${startPage + index === currentPage
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white'
                                }`}
                            onClick={() => handlePageChange(startPage + index)}
                        >
                            {startPage + index}
                        </button>
                    ))}
                    {/* Render "..." if there are more pages to the right */}
                    {totalPages - endPage > 1 && (
                        <span className="px-2 py-2 text-gray-700">...</span>
                    )}
                    {/* Render last page button */}
                    {totalPages > endPage && (
                        <button
                            className={`px-4 py-2 bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white`}
                            onClick={() => handlePageChange(totalPages)}
                        >
                            {totalPages}
                        </button>
                    )}
                    <button
                        className={`px-4 py-2 ${tableData.take * currentPage >= tableData.total
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                            } rounded-r`}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={tableData.take * currentPage >= tableData.total}
                    >
                        Next
                    </button>
                </div>
            </div>
            <div></div>
        </div>
    );
};

export default CustomTable;



interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    jsonString: string;
}

const Popup: React.FC<PopupProps> = ({ isOpen, onClose, jsonString }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
            <div className="relative w-auto max-w-3xl mx-auto my-6">
                {/* Content */}
                <div className="relative bg-white border-2 border-gray-300 rounded-lg shadow-lg">
                    {/* Header */}
                    <div className="flex items-center	 justify-between p-5 border-b border-solid border-gray-300 rounded-t">
                        <h3 className="text-2xl font-semibold ">JSON Data</h3>
                        <button
                            className="p-1 ml-auto bg-transparent border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                            onClick={onClose}
                        >
                            <span className="text-black bg-transparent block outline-none focus:outline-none">×</span>
                        </button>
                    </div>
                    {/* Content */}
                    <div className="relative p-6">
                        <pre className="bg-gray-200 p-4 rounded-lg text-gray-800 whitespace-pre-wrap break-words h-[50vh] overflow-y-auto	">
                            {jsonString}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

