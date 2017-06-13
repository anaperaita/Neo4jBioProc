package protein_structure;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Scanner;

import org.junit.Test;


/**
 * Test unitario para el wrapper de pred
 */
public class ProteinStructureTest {

	/**
	 * Testes al funcionamiento del wrapper de python
	 */
	@Test
	public void predFuncTest() 
	{
		Path filePath = Paths.get("src/test/testfile/test.txt");
		Scanner scanner;
		try {
			scanner = new Scanner(filePath);
		
			
			String sequence=scanner.next();
			
			assertEquals(scanner.next(), ProteinStructure.pred(sequence));
			    

		} catch (IOException e) {
			fail(e.getLocalizedMessage());
		}
	}
}
