import PropTypes from "prop-types";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { ArrowRightIcon } from "@mui/x-date-pickers";
import UsersIcon from "@heroicons/react/24/solid/UsersIcon";
import { useRouter } from "next/router";
import ArrowDownOnSquareIcon from "@heroicons/react/24/solid/ArrowDownOnSquareIcon";
import { handleDownload } from "src/utils/download-data";


export const OverviewData = (props) => {
  const { sx, data } = props;
  const router = useRouter();
  return (
    <>
    
    <Card sx={sx}>
     
      <CardContent>
      
        <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              Total Data
            </Typography>
            <Typography variant="h4">{data?.length}</Typography>
          
          </Stack>
          <Avatar
            sx={{
              backgroundColor: "error.man",
              height: 56,
              width: 56,
            }}
          >
            <SvgIcon>
              <UsersIcon />
            </SvgIcon>
          </Avatar>
        </Stack>
        <CardActions sx={{ justifyContent: "space-between" }} style={{ "marginBottom": "-25px"}}>
        <Button
            color="text.secondary"
            endIcon={
              <SvgIcon fontSize="small">
              <ArrowDownOnSquareIcon />
            </SvgIcon>
            }
            size="small"
            variant="caption"
            onClick={()=>{
              handleDownload(data)
            }}
            >
            Download
          </Button>
          <Button
            color="text.secondary"
            endIcon={
              <SvgIcon fontSize="small">
                <ArrowRightIcon />
              </SvgIcon>
            }
            size="small"
            variant="caption"
            onClick={()=>{
              router.push({ pathname: '/customers'});
            }}
            >
            View all
          </Button>
         
        </CardActions>
      </CardContent>
    </Card>
</>
  );
};

OverviewData.prototypes = {
  sx: PropTypes.object,
  value: PropTypes.number,
};
