import * as React from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TextField from "@mui/material/TextField";
import timesliceHelper from "./helper/timeslice.helper";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import AlarmIcon from "@mui/icons-material/Alarm";
import LoadingButton from "@mui/lab/LoadingButton";

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const [history, setHistory] = React.useState([]);
  const [frequency, setFrequency] = React.useState(row.frequency);
  const [active, setActive] = React.useState(false);

  const getJobHistory = () => {
    fetch(`http://localhost:5000/api/cron-job/history?id=${row.id}`)
      .then((res) => res.json())
      .then((res) => {
        setHistory(res);
      });
  };

  const updateCron = (id, frequency) => {
    fetch(`http://localhost:5000/api/cron?id=${id}&frequency=${frequency}`, {
      method: "PATCH",
    })
      .then((res) => res.json())
      .then((res) => {
        setActive(false);
        row.frequency = frequency;
      });
  };

  const frequencyChange = (row, frequency) => {
    setFrequency(frequency);
    if (row.frequency !== frequency) {
      setActive(true);
    } else {
      setActive(false);
    }
  };
  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => {
              getJobHistory();
              setOpen(!open);
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.id}
        </TableCell>
        <TableCell align="right">{row.message}</TableCell>
        <TableCell align="right">
          <Box
            component="form"
            sx={{
              "& .MuiTextField-root": { m: 1, width: "15ch" },
            }}
            noValidate
            autoComplete="off"
          >
            <Stack direction="row" spacing={2} justifyContent="end">
              <TextField
                id="outlined-number"
                label="Seconds"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                value={frequency}
                onChange={(e) => {
                  frequencyChange(row, e.target.value);
                }}
              />
              {!active ? (
                <Button variant="contained" endIcon={<AlarmIcon />} disabled>
                  Update
                </Button>
              ) : (
                <Button
                  variant="contained"
                  endIcon={<AlarmIcon />}
                  onClick={() => updateCron(row.id, Number(frequency))}
                >
                  Update
                </Button>
              )}
            </Stack>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Emails
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Sender</TableCell>
                    <TableCell>Receiver</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history &&
                    history.length > 0 &&
                    history.map((historyRow) => (
                      <TableRow key={historyRow.id}>
                        <TableCell>{historyRow.emailSender}</TableCell>
                        <TableCell>{historyRow.emailReceiver}</TableCell>
                        <TableCell component="th" scope="row">
                          {`${historyRow.sentAt} (${timesliceHelper(
                            new Date(historyRow.sentAt)
                          )})`}
                        </TableCell>
                        <TableCell>
                          {historyRow.isEmailSent === true ? "✅" : "❌"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function CollapsibleTable() {
  const [rows, setRows] = React.useState([]);
  const [message, setMessage] = React.useState("Hello World");
  const [frequency, setFrequency] = React.useState(1800);
  const [loading, setLoading] = React.useState(false);

  function handleClick() {
    setLoading(true);

    fetch(
      `http://localhost:5000/api/cron?frequency=${frequency}&message=${message}`,
      {
        method: "POST",
      }
    )
      .then((res) => res.json())
      .then((res) => {
        setRows([...rows, res]);
      });
    setLoading(false);
  }

  const getCrons = () => {
    fetch("http://localhost:5000/api/cron")
      .then((res) => res.json())
      .then((res) => {
        setRows(res);
      });
  };

  React.useEffect(() => {
    getCrons();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Cron id</TableCell>
            <TableCell align="right">Message</TableCell>
            <TableCell align="right">Frequency</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </TableBody>
      </Table>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Stack spacing={2} minHeight="100vh" margin={"50px"}>
          <TextField
            required
            id="outlined-required"
            label="Message to be sent"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <TextField
            id="outlined-number"
            label="Frequency (seconds)"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          />
          <LoadingButton
            onClick={handleClick}
            loading={loading}
            loadingIndicator="Creating..."
            variant="outlined"
          >
            CREATE A CRON
          </LoadingButton>
        </Stack>
      </Box>
    </TableContainer>
  );
}
