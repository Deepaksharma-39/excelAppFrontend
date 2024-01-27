import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import {
  Box,
  CircularProgress,
  Container,
   Stack,
  Typography,
} from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { CustomersTable } from "src/sections/customer/customers-table";
import { CustomersSearch } from "src/sections/customer/customers-search";
import { Button } from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDataContext } from "src/contexts/data-context";
import { handleDownload } from "src/utils/download-data";
import FilterPop from "src/utils/filter-report";

const Page = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { data } = useDataContext();
  const [count, setCount] = useState(0);
  const [value, setValue] = useState(data);
  const [searchTerm, setSearchTerm] = useState("");
  const [personName, setPersonName] = useState([]);
  const [uniqueCity,setUniqueCity]=useState([]);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState({
    city: [],
    whatsappStatus: "All",
    employeeStatus: "All",
    whatsappFromDate: null,
    whatsappToDate: null,
    smsStatus: "All",
    smsFromDate: null,
    smsToDate: null,
    callingStatus: "All",
    callingFromDate: null,
    callingToDate: null,
    axisBankStatus: "All",
    sbiBankStatus: "All",
  });

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    if (data) {
      setValue(data);
      setCount(data.length);
      const uniqueCities = [...new Set(data?.map(item => item.CITY.toLowerCase()))];
      setUniqueCity(uniqueCities);
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

  const handleFilterClick = () => {
    setFilterOpen(true);
  };

  const handleFilterClose = () => {
    setFilterOpen(false);
  };

  const handleFilterOptionClick = () => {
    // Use filterValues state to filter your main data


    const filteredData = data.filter(item => {
      // Check for whatsappStatus
      if (filterValues.whatsappStatus !== "All") {
          if (filterValues.whatsappStatus === "No Status") {
              if (item["WHATS APP"] !== undefined && item["WHATS APP"] !== null && item["WHATS APP"] !== "") {
                  return false;
              }
          } else if (item["WHATS APP"]?.toUpperCase() !== filterValues.whatsappStatus.toUpperCase()) {
              return false;
          }
      }
  
      // Check for smsStatus
      if (filterValues.smsStatus !== "All") {
          if (filterValues.smsStatus === "No Status") {
              if (item["SMS"] !== undefined && item["SMS"] !== null && item["SMS"] !== "") {
                  return false;
              }
          } else if (item["SMS"]?.toUpperCase() !== filterValues.smsStatus.toUpperCase()) {
              return false;
          }
      }
  
      // Check for callingStatus
      if (filterValues.callingStatus !== "All") {
          if (filterValues.callingStatus === "No Status") {
              if (item["CALLING"] !== undefined && item["CALLING"] !== null && item["CALLING"] !== "") {
                  return false;
              }
          } else if (item["CALLING"]?.toUpperCase() !== filterValues.callingStatus.toUpperCase()) {
              return false;
          }
      }
  
      // Check for axisBankStatus
      if (filterValues.employeeStatus !== "All") {
          if (filterValues.employeeStatus === "No Status") {
              if (item["Employment Type"] !== undefined && item["Employment Type"] !== null && item["Employment Type"] !== "") {
                  return false;
              }
          } else if (item["Employment Type"]?.toUpperCase() !== filterValues.employeeStatus.toUpperCase()) {
              return false;
          }
      }
  
      // Check for axisBankStatus
      if (filterValues.axisBankStatus !== "All") {
          if (filterValues.axisBankStatus === "No Status") {
              if (item["BANKS STATUS"] !== undefined && item["BANKS STATUS"] !== null && item["BANKS STATUS"] !== "") {
                  return false;
              }
          } else if (item["BANKS STATUS"]?.toUpperCase() !== filterValues.axisBankStatus.toUpperCase()) {
              return false;
          }
      }
  
      // Check for sbiBankStatus
      if (filterValues.sbiBankStatus !== "All") {
          if (filterValues.sbiBankStatus === "No Status") {
              if (item["BANKS STATUS_1"] !== undefined && item["BANKS STATUS_1"] !== null && item["BANKS STATUS_1"] !== "") {
                  return false;
              }
          } else if (item["BANKS STATUS_1"]?.toUpperCase() !== filterValues.sbiBankStatus.toUpperCase()) {
              return false;
          }
      }
  
      // Check for city
      if (filterValues.city.length > 0 && !filterValues.city.some(city => city.toUpperCase() === item["CITY"]?.toUpperCase())) {
          return false;
      }
  
      return true;
  });
  
    
    setCount(filteredData?.length)
    setValue(filteredData)

    setFilterOpen(false);
  };
  
  useEffect(() => {
    setFilterValues(prevValues => ({
        ...prevValues,
        city: personName
    }));
}, [personName]);

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
        <Container maxWidth="xl">
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Typography variant="h4">Data Reports</Typography>
              <Stack alignItems="center" direction="row" spacing={1}>
                <CustomersSearch searchTerm={searchTerm} handleSearchChange={handleSearchChange} />
                <Button onClick={handleFilterClick}>Filter</Button>
              </Stack>
            </Stack>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Button
                color="danger"
                disabled={!data}
                onClick={() => {
                  handleDownload(value, "Data");
                }}
              >
                Download
              </Button>
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
      <FilterPop personName={personName} setPersonName={setPersonName} filterValues={filterValues} setFilterValues={setFilterValues} cities={uniqueCity} isFilterOpen={isFilterOpen} setFilterOpen={setFilterOpen} handleFilterClose={handleFilterClose} handleFilterOptionClick={handleFilterOptionClick}/>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
