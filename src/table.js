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
import Bar from "./bar";
import Swal from "sweetalert2";
import { TableFooter, TablePagination } from "@mui/material";
import { TablePaginationActions } from "./tablePagination";

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const [history, setHistory] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [frequency, setFrequency] = React.useState(row.frequency);
  const [active, setActive] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const getJobHistory = (token, page, limit) => {
    const pageString = `&page=${page}`;
    const limitString = `&limit=${limit > 0 ? limit : total}`;
    fetch(
      `http://localhost:5000/api/cron-job/history?id=${row.id}${
        page ? pageString : ""
      }${limit ? limitString : ""}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.result) setHistory(res.result);
        if (res.total) setTotal(res.total);
      });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);

    getJobHistory(props.token, newPage + 1, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    getJobHistory(props.token, 1, event.target.value);
    setRowsPerPage(parseInt(event.target.value));
    setPage(0);
  };

  const updateCron = (id, frequency, token) => {
    fetch(`http://localhost:5000/api/cron`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id,
        frequency,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.statusCode) {
          const { message } = res;
          Swal.fire({
            position: "top-end",
            icon: "error",
            title: "Error",
            text: message,
            showConfirmButton: true,
          });
        } else {
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Cron has been updated",
            showConfirmButton: false,
            timer: 1500,
          });
          setActive(false);
          row.frequency = frequency;
        }
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

  const onJobHistoryOpen = (token) => {
    if (open) {
      setOpen(false);
    } else {
      getJobHistory(token);
      setOpen(true);
    }
  };
  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => onJobHistoryOpen(props.token)}
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
                InputProps={{
                  inputProps: {
                    min: 5,
                  },
                }}
                value={frequency}
                onChange={(e) => {
                  frequencyChange(row, e.target.value);
                }}
              />
              {localStorage.getItem("role") === btoa("admin") ? (
                !active ? (
                  <Button variant="contained" endIcon={<AlarmIcon />} disabled>
                    Update
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    endIcon={<AlarmIcon />}
                    onClick={() =>
                      updateCron(row.id, Number(frequency), props.token)
                    }
                  >
                    Update
                  </Button>
                )
              ) : (
                <></>
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
            <Table>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[
                      5,
                      10,
                      15,
                      { label: "All", value: -1 },
                    ]}
                    colSpan={3}
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    SelectProps={{
                      inputProps: {
                        "aria-label": "rows per page",
                      },
                      native: true,
                    }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function CollapsibleTable({ token, setToken }) {
  const [rows, setRows] = React.useState([]);
  const [message, setMessage] = React.useState("Hello World");
  const [frequency, setFrequency] = React.useState(1800);
  const [loading, setLoading] = React.useState(false);

  function handleClick() {
    if (frequency < 5) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Error",
        text: "frequency must be atleast greater than or equal to 5 seconds",
        showConfirmButton: true,
      });

      return;
    }
    setLoading(true);

    fetch(`http://localhost:5000/api/cron`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        frequency,
        message,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.statusCode) {
          const { message } = res;
          Swal.fire({
            position: "top-end",
            icon: "error",
            title: "Error",
            text: message,
            showConfirmButton: true,
          });
        } else {
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "New cron has been created",
            showConfirmButton: false,
            timer: 1500,
          });
          setRows([...rows, res]);
        }
      });
    setLoading(false);
  }

  const getCrons = () => {
    fetch("http://localhost:5000/api/cron", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setRows(res);
      });
  };

  React.useEffect(() => {
    getCrons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Bar setToken={setToken} />
      <div style={{ display: "flex" }}>
        {localStorage.getItem("role") === btoa("admin") && (
          <Box minHeight="100vh" minWidth={"30vw"}>
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
                InputProps={{
                  inputProps: {
                    min: 5,
                  },
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
        )}
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
                <Row key={row.id} row={row} token={token} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
}
