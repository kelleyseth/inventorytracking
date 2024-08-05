'use client'

import { useState, useEffect, useRef } from 'react';
import { Camera } from 'react-camera-pro';
import { firestore } from "/firebase";
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { deleteDoc, query, collection, doc, getDocs, getDoc, setDoc } from "firebase/firestore";
import { OpenAI } from 'openai';

export default function Home() {
  // const openai = new OpenAI({apiKey: process.env.REACT_APP_OPENAI_API_KEY})
  // const key = process.env.OPENAI_API_KEY
  // console.log(key)
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [openE, setOpenE] = useState(false)
  const [openCamMod, setCamMod] = useState(false)
  const [itemName, setItemName] = useState('')
  const [oldItemName, setOldItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')
  const [filterName, setFilterName] = useState('')

  const camera = useRef(null)
  const [image, setImage] = useState(null)

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item) => {
    var lower = item.toLowerCase()
    const docRef = doc(collection(firestore, 'inventory'), lower)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    }
    else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    var lower = item.toLowerCase()
    const docRef = doc(collection(firestore, 'inventory'), lower)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1)
        await deleteDoc(docRef)
      else
        await setDoc(docRef, { quantity: quantity - 1 })
    }

    await updateInventory()
  }

  const editItem = async (item, newName, amount) => {
    var lower = item.toLowerCase()
    const docRef = doc(collection(firestore, 'inventory'), lower)
    const docSnap = await getDoc(docRef)
    const { quantity } = docSnap.data()

    await deleteDoc(docRef)

    if (amount == '') {
      amount = quantity
    }
    if (newName == '')
      newName = lower

    const newDocRef = doc(collection(firestore, 'inventory'), newName)

    await setDoc(newDocRef, { quantity: amount })
    await updateInventory()
  }

  const deleteItem = async (item) => {
    var lower = item.toLowerCase()
    const docRef = doc(collection(firestore, 'inventory'), lower)

    await deleteDoc(docRef)
    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleOpenE = () => setOpenE(true)
  const handleCloseE = () => setOpenE(false)

  const openCam = () => setCamMod(true)
  const closeCam = () => setCamMod(false)

  const searchItem = filterName.toLowerCase()
  const filteredInventory = inventory.filter(item => item.name.includes(searchItem));

  return (
    <Box
      width='100vw'
      height='100vh'
      display='flex'
      flexDirection='row'
      bgcolor='#212121'
    >
      <Modal
        open={open}
        onClose={handleClose}
      >
        <Box
          position='absolute'
          top='50%'
          left='50%'
          width={400}
          bgcolor='white'
          border='2px solid #000'
          boxShadow={24}
          p={4}
          display='flex'
          flexDirection='column'
          gap={3}
          sx={{
            transform: 'translate(-50%,-50%)',
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack
            width='100%'
            direction='row'
            spacing={2}
          >
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              placeholder='Item Name'
              onChange={(e) => {
                setItemName(e.target.value)
              }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
            >Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Modal
        open={openE}
        onClose={handleCloseE}
      >
        <Box
          position='absolute'
          top='50%'
          left='50%'
          width={400}
          bgcolor='white'
          border='2px solid #000'
          boxShadow={24}
          p={4}
          display='flex'
          flexDirection='column'
          gap={3}
          sx={{
            transform: 'translate(-50%,-50%)',
          }}
        >
          <Typography variant="h6">Edit Item</Typography>
          <Stack
            width='100%'
            direction='row'
            spacing={2}
          >
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              placeholder="Item Name"
              onChange={(e) => {
                setItemName(e.target.value)
              }}
            />
            <TextField
              variant="outlined"
              fullWidth
              value={itemQuantity}
              placeholder="Quantity"
              onChange={(e) => {
                setItemQuantity(e.target.value)
              }}
            />

          </Stack>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              editItem(oldItemName, itemName, itemQuantity)
              setItemName('')
              setItemQuantity('')
              setOldItemName('')
              handleCloseE()
            }}
          >Save
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              deleteItem(oldItemName)
              setItemName('')
              setItemQuantity('')
              setOldItemName('')
              handleCloseE()
            }}
          >Delete Items
          </Button>
        </Box>
      </Modal>
      <Modal
        open={openCamMod}
        onClose={closeCam}
      >
        <Box
          position='absolute'
          top='50%'
          left='50%'
          width={400}
          bgcolor='#424242'
          border='2px solid #000'
          boxShadow={24}
          p={4}
          display='flex'
          flexDirection='column'
          gap={3}
          sx={{
            transform: 'translate(-50%,-50%)',
          }}
        >
          <Camera ref={camera} aspectRatio={16 / 9} />
          <Button variant='contained' onClick={() => {
            setImage(camera.current.takePhoto())
            // use ai to classify item from image variable
            // add item to db with add item method
            setImage(null)
            setItemName('')
            closeCam()
          }}
          >
            Take Photo
          </Button>
        </Box>
      </Modal>
      <Box
        width='30vw'
        bgcolor='#303030'
        padding={5}
      >
        <Typography
          variant="h4"
          color='#f0f0f0'
        >Pantry Tracker</Typography>
      </Box>
      <Box
        width='70vw'
        padding={5}
      >
        <Box
          height='200px'
          display='flex'
          flexDirection={'column'}
          alignContent='center'
          justifyContent='center'
        >
          <Typography
            variant="h4"
            color='#f0f0f0'
            paddingBottom={5}
          >
            My Inventory
          </Typography>
          <Box
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'space-between'}
          >
            <Button
              variant="contained"
              onClick={() => {
                handleOpen()
              }}
            >
              Add New Item
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                openCam()
              }}
            >
              Add From Image
            </Button>
            <TextField
              placeholder="Search Items"
              value={filterName}
              onChange={(e) => {
                setFilterName(e.target.value)
              }}
              sx={{
                input: {
                  color: "black",
                  background: "white",
                  borderRadius: 15
                }
              }}
            />
          </Box>
          <Box
            width='100%'
            minHeight='100px'
            display='flex'
            alignItems='center'
            textAlign={'center'}
            justifyContent='space-between'
            color={'#f0f0f0'}
            variant='h6'
            padding={5}
          >
            <Typography >Item Name</Typography>
            <Typography >Quantity</Typography>
            <Typography >Actions</Typography>
          </Box>
        </Box>
        <Stack
          height={'70vh'}
          overflow='auto'
        >
          {
            filteredInventory.map(({ name, quantity }) => (
              <Box
                key={name}
                width='100%'
                minHeight='100px'
                display='flex'
                alignItems='center'
                textAlign={'center'}
                justifyContent='space-between'
                bgcolor='#303030'
                color={'#f0f0f0'}
                variant='h6'
                padding={5}
              >
                <Typography
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography
                >
                  {quantity}
                </Typography>
                <Stack
                  direction='row'
                  spacing={2}
                >
                  <Button
                    variant="contained"
                    onClick={() => {
                      addItem(name)
                    }}
                  >
                    +
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      removeItem(name)
                    }}
                  >
                    -
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setOldItemName(name)
                      handleOpenE()
                    }}
                  >
                    Edit
                  </Button>
                </Stack>
              </Box>
            ))
          }
        </Stack>
      </Box>
    </Box>
  );
}
