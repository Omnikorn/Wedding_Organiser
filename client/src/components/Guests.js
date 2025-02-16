import React, { useState, useEffect } from "react"
import Container from "@material-ui/core/Container"
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import RemoveIcon from "@material-ui/icons/Remove"
import AddIcon from "@material-ui/icons/Add"
import Icon from "@material-ui/core/Icon"
import emailjs from "emailjs-com"
import Auth from "../utils/auth"
import {
	WEDDING_QUERY,
	GUEST_QUERY,
} from "../utils/queries"
import { ADD_GUESTS } from "../utils/mutations"
import { makeStyles } from "@material-ui/core/styles"
import { useQuery, useMutation } from "@apollo/client"

const service = process.env.REACT_APP_SERVICE_ID
const template = process.env.REACT_APP_TEMPLATE_ID
const user = process.env.REACT_APP_USER_ID

const useStyles = makeStyles((theme) => ({
	root: {
		"& .MuiTextField-root": {
			margin: theme.spacing(1),
		},
	},

	button: {
		margin: theme.spacing(1),
	},
}))

function Guests() {
	const classes = useStyles()

	const [inputFields, setInputField] = useState([
		{ name: "", email: "", rsvp: "", menu: "" },
	])

	const [organiserState, setOrganiserState] = useState(null)
	const [currentUser, setCurrentUser] = useState(null)
	const [currentID, setCurrentID] = useState(null)
	const [brideFirstName, setBrideFirstName] = useState(null)
	const [groomFirstName, setGroomFirstName] = useState(null)
	const [weddingWhen, setWeddingWhen] = useState(null)
	const [weddingVenue, setWeddingVenue] = useState(null)

	useEffect(() => {
		const { organiser } = Auth.loggedIn()
		console.log(
			"this is the organiser from local storage",
			organiser
		)
		setCurrentUser(organiser.username)
		setCurrentID(organiser._id)
	}, [])

	const [addGuests, { error }] = useMutation(ADD_GUESTS)

	// this is the section to fetch wedding data to populate in emails

	// 	const weddingResults = useQuery(WEDDING_QUERY)
	// 	console.log(
	// 		"the data from the BANANA is ",
	// 		weddingResults.data
	// 	)
	// 	 const weddingData = weddingResults.data.weddings.filter((wedding) => {
	// 	// // 	const weddingID = "61110f69077f5da76492affa"
	// 		return wedding.wedding_owner == currentUser
	// 	})
	// 	console.log("this is the filtered wedding", weddingData)
	// setBrideFirstName(weddingData[0].bride_first_name)
	// console.log("the bride is ..... ::",brideFirstName)

	// handle the submit form
	const handleSubmit = async (e) => {
		e.preventDefault()

		let i
		for (i = 0; i < inputFields.length; i++) {
			console.log("i=", i, "input= ", inputFields[i])
			try {
				const { data } = await addGuests({
					variables: {
						name: inputFields[i].name,
						email: inputFields[i].email,
						rsvp: inputFields[i].rsvp,
						menu: inputFields[i].menu,
						wedding_owner: currentUser,
					},
				})

				console.log(data)
			} catch (err) {
				console.log(err)
			}
		}
	}

	const handleChangeInput = (index, event) => {
		console.log(index, event.target.name)
		const values = [...inputFields]
		values[index][event.target.name] = event.target.value
		setInputField(values)
	}

	const handleAddField = () => {
		setInputField([
			...inputFields,
			{
				name: "",
				email: "",
				rsvp: "",
				menu: "",
			},
		])
	}

	const handleRemoveField = (index) => {
		const values = [...inputFields]
		values.splice(index, 1)
		setInputField(values)
	}

	function sendEmail(index) {
		// function to send email to each guest based on their index in the table
		const values = [...inputFields]
		const email = values[index].email
		const name = values[index].name

		const params = {
			name: name,
			email: email,
		}

		emailjs
			.send(service, template, params, user)
			.then((res) => {
				console.log(res)
				alert("email sent thank you")
			})
			.catch((err) => console.log(err))
	}

	console.log("this is the current user", currentUser)

	const { loading, data } = useQuery(GUEST_QUERY)
	if (loading) {
		return <p>Loading ....</p>
	}

	console.log("the guest list is", data.guests)

	const filteredGuestList = data.guests.filter((guest) => {
		return guest.wedding_owner == currentUser
	})

	console.log(
		"the filtered guest list is",
		filteredGuestList
	)

	return (
		<Container>
			<h1> Your Guest List</h1>
			<p> my test user id is</p>
			<p>the organiser is {currentUser} </p>
			<p> the user id is {currentID}</p>

			<form
				className={classes.root}
				
			>
				{filteredGuestList.map((guest, index) => (
					<div key={index}>
						<TextField
							name="name"
							label="Guest Name"
							value={guest.name}
							onChange={(event) =>
								handleChangeInput(index, event)
							}
						/>

						<TextField
							name="email"
							label="Email"
							value={guest.email}
							onChange={(event) =>
								handleChangeInput(index, event)
							}
						/>
						<TextField
							name="rsvp"
							label="RSVP"
							value={guest.rsvp}
							onChange={(event) =>
								handleChangeInput(index, event)
							}
						/>
						<TextField
							name="menu"
							label="Menu Choice"
							value={guest.menu}
							onChange={(event) =>
								handleChangeInput(index, event)
							}
						/>
						<Button
							className={classes.button}
							vareient="contained"
							color="secondary"
							onClick={(event) => sendEmail(index)}
						>
							Send email
						</Button>

						<IconButton
							onClick={() => handleRemoveField(index)}
						>
							<RemoveIcon />
						</IconButton>
						<IconButton onClick={() => handleAddField()}>
							<AddIcon />
						</IconButton>
					</div>
				))}
				{/* <Button 
            className={classes.button}
            vareient="contained" 
            color="secondary" 
            type="submit" 
            onClick={handleSubmit}
            endIcon={<Icon>save</Icon>}>
                Save Guest List
                </Button> */}

				{/* </form> */}
				{/* <form className={classes.root} onSubmit={handleSubmit}> */}
				{inputFields.map((inputField, index) => (
					<div key={index}>
						<TextField
							name="name"
							label="Guest Name"
							value={inputField.name}
							onChange={(event) =>
								handleChangeInput(index, event)
							}
						/>

						<TextField
							name="email"
							label="Email"
							value={inputField.email}
							onChange={(event) =>
								handleChangeInput(index, event)
							}
						/>
						<TextField
							name="rsvp"
							label="RSVP"
							value={inputField.rsvp}
							onChange={(event) =>
								handleChangeInput(index, event)
							}
						/>
						<TextField
							name="menu"
							label="Menu Choice"
							value={inputField.menu}
							onChange={(event) =>
								handleChangeInput(index, event)
							}
						/>
						<Button
							className={classes.button}
							vareient="contained"
							color="secondary"
							onClick={(event) => sendEmail(index)}
						>
							Send email
						</Button>

						<IconButton
							onClick={() => handleRemoveField(index)}
						>
							<RemoveIcon />
						</IconButton>
						<IconButton onClick={() => handleAddField()}>
							<AddIcon />
						</IconButton>
					</div>
				))}
				<Button
					className={classes.button}
					vareient="contained"
					color="secondary"
					type="submit"
					onClick={handleSubmit}
					endIcon={<Icon>save</Icon>}
				>
					Save Guest List
				</Button>
			</form>
		</Container>
	)
}

export default Guests