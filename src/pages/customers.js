import { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { Box, CircularProgress, Container, Stack, SvgIcon, Typography } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { CustomersTable } from "src/sections/customer/customers-table";
import { CustomersSearch } from "src/sections/customer/customers-search";
import { applyPagination } from "src/utils/apply-pagination";
import { useData } from "src/hooks/use-data";
import { Button, Col, FormGroup, Input, Row } from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { compareDataArrays, readUploadFile, updateInDB } from "src/utils/upload-data";
import { read, utils } from "xlsx";
import axios from "axios";
import { useDataContext } from "src/contexts/data-context";


const Page = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [count, setCount] = useState(0);
  const [value, setValue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { data, isloading } = useDataContext();
  const [uploadData, setUploadData] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = (
        await axios.get(
          `https://excelappbackend.onrender.com/api/readPagination?page=${page}&pageSize=${rowsPerPage}`
        )
      ).data;
      console.log(result);
      setCount(Math.ceil(result.articles.metadata.totalCount));
      setValue(result.articles.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(event.target.value);
  }, []);

  const readUploadFile = (e) => {
    e.preventDefault();
    setLoading(true);
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
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setValue([]);
    window.location.reload();
  };

  useEffect(() => {
    // Call fetchData when your component mounts or whenever you want to refresh the data
    fetchData();
  }, [page, rowsPerPage]);
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
          <Stack spacing={3}>
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
                          disabled={loading}
                          color="success"
                          onClick={() => {
                            setLoading(true);

                            while(isloading){

                            }
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
                                setLoading(false);

                                alert("Data upload Failed");
                              });
                          }}
                        >
                          {"Upload Data"}
                        </Button>
                      )}{" "}
                      {selectedFile?.name && (
                        <Button disabled={loading || isloading} color="danger" onClick={removeFile}>
                          {"Reset"}
                        </Button>
                      )}{" "}
                    </Col>
                  </Row>
                </Stack>
              </Stack>
            </Stack>
            <CustomersSearch />
            {loading ? (
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
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
