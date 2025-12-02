package at.fhv.payment.presentation;

import at.fhv.payment.application.PaymentService;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/payment")
public class PaymentRestController {

    private final PaymentService paymentService;

    public PaymentRestController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/pay")
    public String pay(@RequestBody String bookingId) {

        boolean success = paymentService.processPayment(bookingId);

        if (success) {
            return "PAYMENT_SUCCESS";
        } else {
            return "PAYMENT_FAILED";
        }
    }
}
