import { screen, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes"
import userEvent from "@testing-library/user-event"

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
      const html = BillsUI({ data: []})
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
    test("loading page", () => {
    })
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

describe("When user click on icon eye", () => {
  test("Then modal should open", () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    const html = BillsUI({ data: bills })
    document.body.innerHTML = html
    const newBills = new Bills({
      document, onNavigate, firestore: null, localStorage: window.localStorage
    })
    jQuery.fn.extend({
      modal: function () {
      },
    });
    const iconEye = screen.queryAllByTestId("icon-eye")
    const handleClickIconEye = jest.fn(e => newBills.handleClickIconEye)
    iconEye[0].addEventListener('click', handleClickIconEye)
    userEvent.click(iconEye[0])
    expect(handleClickIconEye).toHaveBeenCalled()

    const modale = document.getElementById('modaleFile')
    expect(modale).toBeTruthy()
  })
})


})

