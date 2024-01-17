import Head from "next/head";
import { Box, Container, Divider, Unstable_Grid2 as Grid } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { OverviewData } from "src/sections/overview/overview-data";
import { OverviewCityCount } from "src/sections/overview/overview-city-data";
import { OverviewTelecallingData } from "src/sections/overview/overview-telecalling-data";
import { OverviewWhatsAppData } from "src/sections/overview/overview-whatsapp-data";
import { useData } from "src/hooks/use-data";
import { overallData } from "src/utils/filter-data";
import { OverviewSmsData } from "src/sections/overview/overview-sms-data";
import { OverviewEmailData } from "src/sections/overview/overview-email-data";
import { OverviewIVRData } from "src/sections/overview/overview-ivr-data";
import { OverviewAxisBankData } from "src/sections/overview/overview-axisBanking-data";
import { OverviewSBIBankData } from "src/sections/overview/overview-sbiBanking-data";
import { useDataContext } from "src/contexts/data-context";
import axios from "axios";

const Page = () => {
  const { data } = useDataContext();

  const cityCounts = overallData(data);
  const fetchData = async () => {
    try {
      // Make API request to fetch data
      const result = (await axios.get('https://excelappbackend.onrender.com/api/read')).data;
  

      // localStorage.setItem('appData',JSON.stringify(result))
         // Create a Blob containing the JSON data
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });

    // Create a File object from the Blob
    const file = new File([blob], 'appData.json', { type: 'application/json' });

    // You can now use the 'file' variable as needed
    console.log('File created:', file);

    if ("caches" in window) {
      // Opening given cache and putting our data into it
      caches.open(cacheName).then((cache) => {
          cache.put("appData", result);
          alert("Data Added into cache!");
      });
  }
    } catch (error) {
      // If the API request was not successful, handle the error
      console.log(error);
    }
  };
  
  return (
    <>
      <Head>
        <title>Overview | Jai Shree Ram</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        <Container maxWidth="xl">
          <div>
            <button onClick={fetchData}>Fetch and Save Data</button>
          </div>
          <Grid container spacing={1}>
            <Grid xs={12} sm={6} lg={3}>
              <OverviewData sx={{ height: "100%" }} data={data} />
            </Grid>

            <Grid xs={12} sm={6} lg={3}>
              <OverviewTelecallingData sx={{ height: "100%" }} data={data} />
            </Grid>

            <Grid xs={12} sm={6} lg={3}>
              <OverviewWhatsAppData sx={{ height: "100%" }} data={data} />
            </Grid>

            <Grid xs={12} sm={6} lg={3}>
              <OverviewSmsData sx={{ height: "100%" }} data={data} />
            </Grid>

            <Divider />
            <Grid xs={12} sm={6} lg={3}>
              <OverviewEmailData sx={{ height: "100%" }} data={data} />
            </Grid>

            <Grid xs={12} sm={6} lg={3}>
              <OverviewIVRData sx={{ height: "100%" }} data={data} />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <OverviewAxisBankData sx={{ height: "100%" }} data={data} />
            </Grid>

            <Grid xs={12} sm={6} lg={3}>
              <OverviewSBIBankData sx={{ height: "100%" }} data={data} />
            </Grid>

            <Grid xs={12} md={6} lg={4}>
              <OverviewCityCount cities={cityCounts} sx={{ height: "100%" }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
