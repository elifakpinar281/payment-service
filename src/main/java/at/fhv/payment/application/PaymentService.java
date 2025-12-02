package at.fhv.payment.application;

import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class PaymentService {

    private final Random random = new Random();

    public boolean processPayment(String bookingId) {
        return random.nextInt(10) < 9;
    }
}
