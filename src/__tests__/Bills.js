import { screen, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes"
import firebase from "../__mocks__/firebase"

// ********************************************************************
// **************         test coverage BIllsUI           *************
// ********************************************************************

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }))
      const html = BillsUI({ data: [] })
      document.body.innerHTML = html
      const billIcon = screen.getByTestId("icon-window")
      expect(billIcon.classList.contains("active-icon")).toBeTruthy
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("Loading Page success load", () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getByText('Loading...')).toBeTruthy()
    })
    test("Then, it should render ErrorPage", () => {
      const html = BillsUI({ error: true });
      document.body.innerHTML = html;
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    });
  })

  // ********************************************************************
  // **************         test handleClickNewBill         *************
  // ********************************************************************

  describe("Given I am a user connected as Employee", () => {
    describe("When I click on new bill button", () => {
      test("Then new bill page should open", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
        }))
        const html = BillsUI({ data: bills })
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null
        const newBill = new Bills({
          document, onNavigate, firestore, localStorage: window.localStorage
        })
        const handleClickNewBill = jest.fn(newBill.handleClickNewBill)
        const buttonNewBill = screen.getByTestId('btn-new-bill')
        buttonNewBill.addEventListener("click", handleClickNewBill)
        fireEvent.click(buttonNewBill)
        expect(document.getElementsByClassName("content-title")).toBeTruthy()
      })
    })
  })

  // ********************************************************************
  // **************         test handleClickIconEye         *************
  // ********************************************************************

  describe  ("When I click on icon eye", () => {
    test("The modal should be open",() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      const newBills = new Bills ({
        document,
        onNavigate,
        firestore :null,
        localStorage :  window.localStorage
      })

      //mock JQuery.modal
      $.fn.modal = jest.fn()
      
      const iconEye = screen.queryAllByTestId('icon-eye')
      const handelClickIconEye = jest.fn(e => newBills.handleClickIconEye)
      iconEye[0].addEventListener("click", handelClickIconEye)
      fireEvent.click(iconEye[0])
      console.log(iconEye[0])
      expect(handelClickIconEye).toHaveBeenCalled()

      const modale = document.getElementById('modaleFile')
      expect(modale).toBeTruthy()
    })
  })
})

  // ********************************************************************
  // **************          test integration Get           *************
  // ********************************************************************

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})