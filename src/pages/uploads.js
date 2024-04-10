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
import { compareDataArrays, updateInDB } from "src/utils/upload-data";
import { read, utils } from "xlsx";
import { useDataContext } from "src/contexts/data-context";
import { height } from "@mui/system";

const Page = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [count, setCount] = useState(0);
  const [value, setValue] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadData, setUploadData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { data } = useDataContext();

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
      setLoading(true); // Setting loading state when file reading process starts
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
        setLoading(false); // Setting loading state after file reading process completes
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Failed to upload file");
      setLoading(false); // Setting loading state in case of failure
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setValue([]);
    window.location.reload();
  };

  return (
    <>
      <Head>
        <title>Customers | Devias Kit</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 1,
        }}
      >
        {loading ? (
          <Box
            sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Container maxWidth="xl">
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" spacing={4}>
                <Stack spacing={1}>
                  <Typography variant="h4">Upload Data</Typography>
                  <Stack alignItems="center" direction="row" spacing={1}>
                    <Row>
                      <Col
                        md="16 text-left"
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "flex-start",
                          gap: "10px",
                        }}
                      >
                        <FormGroup>
                          <Input
                            id="inputEmpGroupFile"
                            name="file"
                            type="file"
                            onChange={readUploadFile}
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                          />
                        </FormGroup>
                        {value.length !== 0 && (
                          <Button
                            disabled={loading}
                            color="success"
                            onClick={() => {
                              setLoading(true);
                              const result = compareDataArrays(data, value);
                              const res = updateInDB(result);

                              res
                                .then((message) => {
                                  setValue(result.reverse());
                                  setLoading(false);
                                 
                                })
                                .catch((error) => {
                                  console.error("Error:", error);
                                  setLoading(false);

                                  
                                });
                            }}
                          >
                            {"Save Data"}
                          </Button>
                        )}
                      </Col>
                      <Col md="6 text-left">
                        {" "}
                        {selectedFile?.name && (
                          <Button disabled={loading} color="warning" onClick={removeFile}>
                            {"Reset"}
                          </Button>
                        )}{" "}
                      </Col>
                    </Row>
                  </Stack>
                </Stack>
              </Stack>

              {
                <CustomersTable
                  count={count}
                  items={value}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  page={page}
                  rowsPerPage={rowsPerPage}
                />
              }
            </Stack>
          </Container>
        )}
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
