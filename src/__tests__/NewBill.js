import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from '../constants/routes.js'

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      const iconActive = screen.getByTestId("icon-mail")
      expect(iconActive.classList.contains("active-icon")).toBeTruthy
    })
    test("Then I check all formdata was completed", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const inputForm = {
        email: "johndoe@email.com",
        expenseType : "Restaurants et bars",
        expenseName : "test Billed",
        datepicker : "2021-11-26",
        expenseAmount : "100",
        expenseTVA : "70",
        expensePCT : "20",
        expenseCommentary : "homard et foie gras",
        expenseFile : "plat.jpg"
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: inputForm.email
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const inputType = screen.getByTestId("expense-type")
      fireEvent.click(inputType, { target: { value: inputForm.expenseType , name : inputForm.expenseType , selectedIndex : 1}})
      expect(inputType.value).toBe(inputForm.expenseType)

      const inputName = screen.getByTestId("expense-name")
      fireEvent.click(inputName, { target: { value: inputForm.expenseName}})
      expect(inputName.value).toBe(inputForm.expenseName)
      
      const inputDate = screen.getByTestId("datepicker")
      fireEvent.click(inputDate, { target: { value: inputForm.datepicker}})
      expect(inputDate.value).toBe(inputForm.datepicker)
      
      const inputAmount = screen.getByTestId("amount")
      fireEvent.click(inputAmount, { target: { value: inputForm.expenseAmount}})
      expect(inputAmount.value).toBe(inputForm.expenseAmount)
      
      const inputTva = screen.getByTestId("vat")
      fireEvent.click(inputTva, { target: { value: inputForm.expenseTVA}})
      expect(inputTva.value).toBe(inputForm.expenseTVA)

      const inputPct = screen.getByTestId("pct")
      fireEvent.click(inputPct, { target: { value: inputForm.expensePCT}})
      expect(inputPct.value).toBe(inputForm.expensePCT)

      const inputCommentary = screen.getByTestId("commentary")
      fireEvent.click(inputCommentary, { target: { value: inputForm.expenseCommentary}})
      expect(inputCommentary.value).toBe(inputForm.expenseCommentary)

      const firestore = null

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage
      })

      const form = screen.getByTestId("form-new-bill")
      const handleSubmit = jest.fn(e=>newBill.handleSubmit(e))
    
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)
      expect(handleSubmit).toHaveBeenCalledTimes(1)
      expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()
    })
    
    describe("When I use a file with a good extention", () => {
      test("the submit button is available", () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null

        const newBill = new NewBill({
          document,
          onNavigate,
          firestore,
          localStorage: window.localStorage
        })
        const filetest = screen.getByTestId("file")
        const btn = document.getElementById("btn-send-bill")
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        filetest.addEventListener("change", handleChangeFile)
        fireEvent.change(filetest, {
          target: {
            files: [new File(["test"], 'test.jpeg', { type: "image/jpeg" })],
          }
        })
        expect(handleChangeFile).toHaveBeenCalled()
        expect(btn.disabled).toBe(false)
      })
    })
  })

  describe("When I load a file with bad extention", () => {
    test("the submit button is disabled", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage
      })
      const filetest = screen.getByTestId("file")
      const btn = document.getElementById("btn-send-bill")
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      filetest.addEventListener("change", handleChangeFile)
      fireEvent.change(filetest, {
        target: {
          files: [new File(["test"], 'test.txt')],
        }
      })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(btn.disabled).toBeTruthy()
    })
  })
})