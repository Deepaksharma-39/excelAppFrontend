import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import {
  Box,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { CustomersTable } from "src/sections/customer/customers-table";
import { CustomersSearch } from "src/sections/customer/customers-search";
import { Button, Col, FormGroup, Input, Row } from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { compareDataArrays,  updateInDB } from "src/utils/upload-data";
import { read, utils } from "xlsx";
import axios from "axios";
import { useDataContext } from "src/contexts/data-context";
import { handleDownload } from "src/utils/download-data";
import { DatePicker } from "@mui/x-date-pickers";

const Page = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { data, isloading } = useDataContext();
  const [count, setCount] = useState(0);
  const [value, setValue] = useState(data);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadData, setUploadData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    "SMS": "",
    "CALLING": "",
    "WHATS APP": "",
    "BANK STATUS": "",
    "BANK STATUS_1": "",
  });
  const [isFilterOpen, setFilterOpen] = useState(false);
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    if (data) {
      setValue(data);
      setCount(data.length);

      const filteredCustomers = data.filter((customer) =>
        Object.values(customer).some((value) => {
          if (typeof value === "string" || typeof value === "number") {
            const stringValue = String(value).toLowerCase();
            return stringValue.includes(searchTerm.toLowerCase());
          }
          return false;
        })
      );

      if (searchTerm) {
        setValue(filteredCustomers);
      }
    }
  }, [data, searchTerm]);

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(event.target.value);
  }, []);

  const readUploadFile = (e) => {
    e.preventDefault();
    setUploadData([]);
    setPage(0);
    setRowsPerPage(5);
    setValue([]);
    if (e.target.files) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const result = utils.sheet_to_json(worksheet);
        setUploadData(result);
        setValue(result);
        setCount(result.length);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setValue([]);
    window.location.reload();
  };

  const handleFilterClick = () => {
    setFilterOpen(true);
  };

  const handleFilterClose = () => {
    setFilterOpen(false);
  };

  const handleFilterOptionClick = () => {
    // Filter and capture data based on checked checkboxes
    const filteredData = {};
    Object.keys(selectedFilters).forEach((field) => {
      const checkedCheckboxes = Object.keys(selectedFilters[field]).filter(
        (checkbox) => selectedFilters[field][checkbox]
      );
      if (checkedCheckboxes.length > 0) {
        filteredData[field] = checkedCheckboxes;
      }
    });

    // Do something with the filtered data, e.g., save it to the backend
   

    const filteredData1 = filterData(data, filteredData);

// Log the filtered result
    setValue(filteredData1);
    setCount(filteredData1.length)
    // Close the filter dialog
    handleFilterClose();
  };

  const handleCheckboxChange = (field, checkbox) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [field]: {
        ...prevFilters[field],
        [checkbox]: !prevFilters[field][checkbox], // Toggle the checkbox value
      },
    }));
  };

  const filterData = (data, filter) => {
    return data.filter((item) => {
      // Check if all filter conditions for each field are met
      const isMatch = Object.entries(filter).every(([field, filterValues]) => {
        // Skip the field if it doesn't exist in the item
        if (!item.hasOwnProperty(field)) {
          return false;
        }
  
        // Check if the value is included in the filter values (case-insensitive and trimmed)
        const fieldValue = String(item[field]).trim().toUpperCase(); // adjust this based on your data
        const filterValuesUpperCase = filterValues.map(value => String(value).trim().toUpperCase()); // adjust this based on your data
  
        return filterValuesUpperCase.includes(fieldValue);
      });
  
    
      return isMatch;
    });
  }
  

  
  
  return (
    <>
      <Head>
        <title>Customers | Devias Kit</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">Customers</Typography>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Row>
                    <Col md=" text-left">
                      <FormGroup>
                        <Input
                          id="inputEmpGroupFile"
                          name="file"
                          type="file"
                          onChange={readUploadFile}
                          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6 text-left">
                      {selectedFile?.name && (
                        <Button
                          disabled={!data}
                          color="success"
                          onClick={() => {
                            const result = compareDataArrays(uploadData, data);
                            const res = updateInDB(result);

                            res
                              .then((message) => {
                                fetchData();
                                window.location.reload();
                                alert("Data Uploaded successfully");
                              })
                              .catch((error) => {
                                console.error("Error:", error);

                                alert("Data upload Failed");
                              });
                          }}
                        >
                          {"Upload Data"}
                        </Button>
                      )}{" "}
                      {selectedFile?.name && (
                        <Button disabled={!data} color="danger" onClick={removeFile}>
                          {"Reset"}
                        </Button>
                      )}{" "}
                    </Col>
                  </Row>
                </Stack>
              </Stack>
              
            </Stack>
           
            <Stack alignItems="center"  direction="row" spacing={2}>
            <CustomersSearch searchTerm={searchTerm} handleSearchChange={handleSearchChange} />
            <Button onClick={handleFilterClick}>Filter</Button>
            <Button color="danger" disabled={!data} onClick={()=>{
              handleDownload(value,"Data")
            }}>Download</Button>
            </Stack>
            {!data ? (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </Box>
            ) : (
              <CustomersTable
                count={count}
                items={value}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
              />
            )}
          </Stack>
        </Container>
      </Box>
      <Dialog open={isFilterOpen} onClose={handleFilterClose}>
        <DialogTitle>Filter Options</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {Object.keys(selectedFilters).map((field) => (
              <Grid item xs={10} md={5} key={field}>
                {field === "BANK STATUS" ? (
                  <>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedFilters[field]["APPROVE"]}
                          onChange={() => handleCheckboxChange(field, "APPROVE")}
                          color="primary"
                        />
                      }
                      label={`APPROVED AXIS BANK STATUS`}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedFilters[field]["DECLINE"]}
                          onChange={() => handleCheckboxChange(field, "DECLINE")}
                          color="primary"
                        />
                      }
                      label={`DECLINED AXIS BANK STATUS`}
                    />
                  </>
                ) : field === "BANK STATUS_1" ? (
                  <>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedFilters[field]["APPROVE"]}
                          onChange={() => handleCheckboxChange(field, "APPROVE")}
                          color="primary"
                        />
                      }
                      label={`APPROVED SBI BANK STATUS`}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedFilters[field]["DECLINE"]}
                          onChange={() => handleCheckboxChange(field, "DECLINE")}
                          color="primary"
                        />
                      }
                      label={`DECLINED SBI BANK STATUS`}
                    />
                  </>
                ) : (
                  <>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedFilters[field]["FRESH"]}
                          onChange={() => handleCheckboxChange(field, "FRESH")}
                          color="primary"
                        />
                      }
                      label={`FRESH ${field}`}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedFilters[field]["USED"]}
                          onChange={() => handleCheckboxChange(field, "USED")}
                          color="primary"
                        />
                      }
                      label={`USED ${field}`}
                    />
                  </>
                )}
              </Grid>
            ))}
            <Grid item xs={10} md={4} >
           
            <DatePicker label="From"/>
            <DatePicker label="To"/>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setFilterOpen(false);
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={handleFilterOptionClick} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
